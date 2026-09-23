# SPECMATCH — SYSTEM SPECIFICATION---

## 1. PROJECT IDENTITY

- **Project name:** SpecMatch
- **Repository:** https://github.com/meloervy/appcon2026-codetitans-specmatch
- **Software Type:** Intelligent Internal Device Asset Optimization

---

## 2. PROBLEM SPECIFICATION

**Challenge:** Develop a software product or tool that addresses the dispersion of device information and unclear device-selection criteria to improve the circulation and utilization of internal company assets. The challenge includes managing detailed hardware specifications, preventing mismatches between employee needs and assigned devices, and avoiding unnecessary purchases of new hardware.

**Problem statement:** IT departments manage numerous devices with different generations, processors, memory standards, and capabilities. Without objective selection criteria, employees may receive unsuitable devices while usable existing inventory remains underutilized. Develop a solution that objectively matches available devices with user or workload requirements while improving asset utilization and reducing unnecessary procurement.

**Constraints (binding — every design decision below must satisfy these three):**
1. Existing inventory MUST be considered before recommending new purchases. The system must never suggest procurement as a first option.
2. Device-selection recommendations MUST have understandable and objective reasoning. Every recommendation must be traceable to a specific, inspectable score or rule — no unexplained AI output presented as a final answer.
3. Different hardware specifications and work requirements MUST be considered. The requirement model must account for CPU, RAM, storage, GPU, and portability at minimum.

---

## 3. SOLUTION SUMMARY

SpecMatch is a single-tenant, internally-used web application for IT staff. It maintains one authoritative inventory of company devices, defines objective workload requirement profiles, and uses a two-layer matching pipeline (AI-assisted natural-language interpretation + deterministic scoring) to recommend the best existing device for an employee's need — only recommending new procurement when no existing device meets a minimum threshold. It also scans current assignments to detect and report mismatches.

---

## 4. SCOPE DEFINITION

### 4.1 IN SCOPE — MVP (must be built)
- S1: Device inventory management (create, read, update, retire)
- S2: Role/workload profile management (create, read, update)
- S3: Employee records (create, read, update; each linked to zero or one role profile)
- S4: AI-assisted matching: free-text request → structured requirement extraction (Gemini) → ranked device recommendations (deterministic scoring)
- S5: Assignment action: assign a recommended (or manually chosen) device to an employee, update device status accordingly
- S6: Mismatch detection: scan active assignments, flag those failing the scoring threshold against the employee's role profile
- S7: Dashboard: total device count, idle count, utilization percentage, mismatch count, estimated procurement-avoidance savings
- S8: Single-role authentication (IT Staff only — no employee self-service login)

### 4.2 OUT OF SCOPE — explicitly excluded from the hackathon build
- O1: Multi-role permission tiers (admin/staff/employee)
- O2: Automated purchase order / procurement system integration
- O3: Device health monitoring, telemetry, or IoT integration
- O4: Notification systems (email, SMS, push)
- O5: Multi-tenant / multi-company support
- O6: Historical trend analytics beyond current-state snapshot
- O7: Native mobile application (responsive web is sufficient)

**Instruction to AI assistants:** if asked to implement anything under §4.2, decline and point back to this section unless the human explicitly overrides scope for a specific item.

---

## 5. TERMINOLOGY (FIXED — use these exact terms everywhere: code, UI copy, docs)

| Term | Definition |
|---|---|
| Device | A single physical unit of company hardware (laptop or desktop) tracked in inventory |
| Role Profile | A named template of hardware requirements representing a job function or workload category |
| Employee | A person record representing a company staff member who may be assigned a device |
| Assignment | The relationship linking one Device to one Employee for a period of time |
| Match Request | A logged instance of the AI matching pipeline being run, storing input and output |
| Matching Engine | The combined two-layer system (Requirement Extraction + Scoring) that produces device recommendations |
| Requirement Extraction | Layer 1 — Gemini-powered conversion of free-text input into structured requirement fields |
| Scoring | Layer 2 — deterministic weighted-function ranking of devices against a requirement set |
| Mismatch | An active Assignment whose Scoring result against the Employee's Role Profile falls below the match threshold |
| Utilization | Percentage of total non-retired devices currently in `assigned` status |

---

## 6. SYSTEM ARCHITECTURE

### 6.1 Architectural pattern
**Monolith.** Single Laravel application. No separate frontend deployment, no separate API service. Inertia.js binds Laravel routes/controllers directly to React page components — no REST/JSON API contract to design or version separately from the controllers themselves.

**Rationale (do not deviate):** the 28.5-hour build window does not permit the overhead of CORS configuration, dual authentication handling, or independent deploy pipelines that a decoupled SPA + API architecture would require.

### 6.2 Layered structure within the monolith

```
┌─────────────────────────────────────────────┐
│  React Components (resources/js/Pages/*)     │
│  — rendered via Inertia, receive props       │
│    from controllers, no direct API calls     │
└───────────────────┬───────────────────────────┘
                    Inertia (props, not JSON API)
┌───────────────────▼───────────────────────────┐
│  Laravel Controllers (app/Http/Controllers)   │
│  — validate input, call Services, return      │
│    Inertia::render() with data                │
└───────────────────┬───────────────────────────┘
                     │
        ┌────────────┼─────────────┐
        ▼                          ▼
┌───────────────┐        ┌────────────────────┐
│ MatchingService│        │  GeminiService      │
│ (app/Services) │        │  (app/Services)      │
│ — pure PHP      │        │  — wraps Gemini API  │
│ — deterministic │        │  — prompt templates  │
│ — no external   │        │  — JSON parsing +    │
│   calls          │        │    validation         │
└───────┬───────┘        └──────────┬──────────┘
        │                            │
        ▼                            │
┌────────────────────────────────────▼──────────┐
│  Eloquent Models (app/Models)                  │
│  Device, RoleProfile, Employee, Assignment,    │
│  MatchRequest                                  │
└───────────────────┬───────────────────────────┘
                     ▼
                  MySQL
```

### 6.3 Component responsibilities (binding contract for AI-generated code)

- **Controllers**: MUST stay thin. Only: validate request → call one Service method → return `Inertia::render()`. No business logic, no scoring math, no Gemini calls directly inside a controller.
- **`MatchingService`** (`app/Services/MatchingService.php`): MUST contain zero external HTTP calls. Pure, deterministic, unit-testable PHP. Owns Layer 2 (see §8).
- **`GeminiService`** (`app/Services/GeminiService.php`): MUST be the only class that calls the Gemini API. Owns Layer 1 (see §7). MUST catch and handle malformed/failed responses internally and return a typed result object or throw a specific, catchable exception — never let a raw Gemini exception bubble to a controller.
- **Models**: standard Eloquent, relationships defined per §9. No business logic beyond relationship definitions, casts, and scopes.

---

## 7. LAYER 1 — REQUIREMENT EXTRACTION (AI, GOOGLE GEMINI)

### 7.1 Purpose
Convert an unstructured, human-written request into the same structured shape as a Role Profile, so it can be scored against inventory in Layer 2.

### 7.2 Input
Free text, e.g.: `"New hire joining as a video editor, needs to handle 4K footage and travel between sites occasionally."`

### 7.3 Output contract (Gemini MUST be prompted to return exactly this JSON shape, nothing else)
```json
{
  "min_cpu_tier": "entry | mid | high | workstation",
  "min_ram_gb": integer,
  "min_storage_gb": integer,
  "requires_gpu": boolean,
  "min_gpu_tier": "none | integrated | dedicated-entry | dedicated-high",
  "portability_required": boolean,
  "reasoning": "one-sentence plain-language explanation of why these values were chosen"
}
```

### 7.4 Processing rules
- `GeminiService::extractRequirements(string $rawInput): array` is the method signature.
- The prompt sent to Gemini MUST instruct it to return ONLY valid JSON, no markdown fences, no prose before/after.
- On response, `GeminiService` MUST attempt `json_decode`. If decoding fails, or required keys are missing, throw `RequirementExtractionException` — do not silently substitute defaults without surfacing the failure to the caller.
- Every extraction attempt (successful or failed) MUST be logged to `match_requests` (see §9.5), including `raw_input` and either `extracted_requirements` or an error marker.
- The `reasoning` field returned by Gemini MUST be surfaced in the UI next to the recommendation — this satisfies contest Constraint #2 (understandable and objective reasoning) at the extraction stage; Layer 2 satisfies it at the scoring stage.

---

## 8. LAYER 2 — SCORING & RANKING (DETERMINISTIC)

### 8.1 Purpose
Given a structured requirement set (from Layer 1, or directly from a stored Role Profile), score every eligible Device and return a ranked list. This layer satisfies Constraint #1 (existing inventory considered first) and Constraint #2 (objective, explainable reasoning).

### 8.2 Method signature
```php
MatchingService::rankDevices(array $requirements, ?int $excludeDeviceId = null): array
```
Returns an array of `['device' => Device, 'score' => float, 'rationale' => string, 'disqualified' => bool]`, sorted descending by score.

### 8.3 Eligibility filter (hard requirements — applied BEFORE scoring, not as part of the weighted score)
A Device is excluded entirely (not merely down-ranked) if:
- `status !== 'available'`
- `requires_gpu === true` AND device `gpu_tier === 'none'`

### 8.4 Scoring formula (weighted, applied only to devices that pass §8.3)
```
score = (cpu_tier_match_score   * 0.30)
      + (ram_sufficiency_score  * 0.25)
      + (storage_sufficiency_score * 0.15)
      + (gpu_match_score        * 0.20)
      + (portability_match_score * 0.10)
```

Each sub-score is normalized to a 0.0–1.0 range:
- **cpu_tier_match_score**: 1.0 if device tier === required tier; 0.8 if device tier is exactly one tier above requirement (discourages but doesn't forbid over-provisioning); 0.4 if two tiers above; 0.0 if below requirement.
- **ram_sufficiency_score**: 1.0 if `device.ram_gb === required.min_ram_gb` (± a small tolerance band, e.g. within 2GB); 0.85 if device RAM exceeds requirement; linear falloff toward 0.0 as device RAM falls below requirement, reaching 0.0 at requirement minus 50%.
- **storage_sufficiency_score**: same shape as RAM sufficiency, applied to `storage_gb`.
- **gpu_match_score**: 1.0 if `requires_gpu === false` and device has no GPU (correct non-waste match); 1.0 if `requires_gpu === true` and device `gpu_tier === required.min_gpu_tier`; 0.7 if device GPU tier exceeds requirement; 0.3 if `requires_gpu === false` but device has a dedicated GPU (flags a potential over-provisioning waste elsewhere in the fleet); scaled down otherwise.
- **portability_match_score**: 1.0 if `portability_required` matches `device_type === 'laptop'`; 0.0 if `portability_required === true` and device is a desktop; 0.6 if `portability_required === false` and device is a laptop (usable but not optimal allocation).

### 8.5 Threshold rule
- `MATCH_THRESHOLD = 0.65` (define as a class constant in `MatchingService`, not a magic number inline).
- If the top-ranked device's score is `< MATCH_THRESHOLD`, OR no device passes the §8.3 eligibility filter, the result set MUST include a flag `procurement_recommended: true`. This is the ONLY circumstance under which the system suggests buying new hardware — enforces Constraint #1.

### 8.6 Rationale generation
Each returned device MUST include a plain-language `rationale` string built from the actual sub-scores (e.g., `"Meets CPU and RAM requirements exactly. GPU tier slightly below request — acceptable for occasional use."`). This string is generated in `MatchingService` from the sub-score values, NOT by calling Gemini again — keeps Layer 2 fully deterministic and explainable, per Constraint #2.

### 8.7 Mismatch detection (reuses this same engine)
For every row in `assignments` where `unassigned_at IS NULL`:
1. Load the employee's `role_profile` requirements (if no profile assigned, skip — cannot evaluate).
2. Run `rankDevices()` scoped to just that one currently-assigned device (i.e., score it directly rather than ranking against the full fleet).
3. If score `< MATCH_THRESHOLD`: mark as mismatch. Classify as `under-provisioned` if the device fails on capability sub-scores (CPU/RAM/storage/GPU), or `over-provisioned` if it only fails on the "over-spec wastage" branches of §8.4 (e.g., dedicated GPU on a no-GPU-required role).

---

## 9. DATA MODEL

### 9.1 `devices`
| Column | Type | Constraints |
|---|---|---|
| id | bigint | PK, auto-increment |
| asset_tag | string(50) | unique, not null |
| device_type | enum('laptop','desktop') | not null |
| brand | string(100) | not null |
| model | string(100) | not null |
| cpu | string(150) | not null |
| cpu_tier | enum('entry','mid','high','workstation') | not null |
| ram_gb | unsignedInteger | not null |
| storage_type | enum('HDD','SSD') | not null |
| storage_gb | unsignedInteger | not null |
| gpu | string(150) | nullable |
| gpu_tier | enum('none','integrated','dedicated-entry','dedicated-high') | not null, default 'none' |
| year_acquired | unsignedSmallInteger | not null |
| condition | enum('excellent','good','fair','needs_repair','retired') | not null |
| status | enum('available','assigned','in_repair','retired') | not null, default 'available' |
| notes | text | nullable |
| timestamps | — | created_at, updated_at |

### 9.2 `role_profiles`
| Column | Type | Constraints |
|---|---|---|
| id | bigint | PK |
| name | string(100) | not null, unique |
| min_cpu_tier | enum('entry','mid','high','workstation') | not null |
| min_ram_gb | unsignedInteger | not null |
| min_storage_gb | unsignedInteger | not null |
| requires_gpu | boolean | not null, default false |
| min_gpu_tier | enum('none','integrated','dedicated-entry','dedicated-high') | nullable |
| portability_required | boolean | not null, default false |
| description | text | nullable |
| timestamps | — | |

### 9.3 `employees`
| Column | Type | Constraints |
|---|---|---|
| id | bigint | PK |
| name | string(150) | not null |
| department | string(100) | not null |
| role_profile_id | bigint | FK → role_profiles.id, nullable, onDelete set null |
| notes | text | nullable |
| timestamps | — | |

### 9.4 `assignments`
| Column | Type | Constraints |
|---|---|---|
| id | bigint | PK |
| device_id | bigint | FK → devices.id, not null |
| employee_id | bigint | FK → employees.id, not null |
| assigned_at | timestamp | not null |
| unassigned_at | timestamp | nullable (null = currently active) |
| match_score | decimal(4,3) | nullable |
| assignment_source | enum('ai_recommended','manual_override') | not null |
| timestamps | — | |

**Invariant (enforce in `MatchingService`/controller logic, not just DB):** a given `device_id` may have at most one row with `unassigned_at IS NULL` at any time. Same for `employee_id`. Enforce by unassigning any prior active row before creating a new one, inside a DB transaction.

### 9.5 `match_requests`
| Column | Type | Constraints |
|---|---|---|
| id | bigint | PK |
| employee_id | bigint | FK → employees.id, nullable |
| raw_input | text | not null |
| extracted_requirements | json | nullable (null if extraction failed) |
| recommended_device_ids | json | nullable |
| extraction_failed | boolean | not null, default false |
| created_at | timestamp | |

### 9.6 Eloquent relationships
- `Device::assignments()` → hasMany(Assignment)
- `Device::activeAssignment()` → hasOne(Assignment)->whereNull('unassigned_at')
- `RoleProfile::employees()` → hasMany(Employee)
- `Employee::roleProfile()` → belongsTo(RoleProfile)
- `Employee::assignments()` → hasMany(Assignment)
- `Employee::activeAssignment()` → hasOne(Assignment)->whereNull('unassigned_at')
- `Assignment::device()` → belongsTo(Device)
- `Assignment::employee()` → belongsTo(Employee)
- `MatchRequest::employee()` → belongsTo(Employee)

---

## 10. APPLICATION ROUTES / SCREENS

| # | Route (suggested) | Inertia Page Component | Purpose |
|---|---|---|---|
| 1 | `/login` | `Auth/Login` | IT staff authentication |
| 2 | `/dashboard` | `Dashboard/Index` | Utilization %, idle count, mismatch count, savings estimate |
| 3 | `/devices` | `Devices/Index` | List + filter inventory |
| 4 | `/devices/{id}` | `Devices/Show` | View/edit single device |
| 5 | `/devices/create` | `Devices/Create` (or modal on Index) | Register new device |
| 6 | `/role-profiles` | `RoleProfiles/Index` | List + create/edit profiles (modal-based acceptable) |
| 7 | `/employees` | `Employees/Index` | List + view employee, current device, role profile |
| 8 | `/match` | `Match/Request` | Text input → extraction → ranked recommendations → assign action |
| 9 | `/mismatches` | `Mismatches/Index` | Flagged assignments, reassign shortcut |

**Fallback under time pressure (explicit permission to deviate):** screens 5 and 6 may be implemented as modals within screens 3 and 7 respectively. Screen 9 may be a filtered query parameter on screen 2 rather than a standalone route. Do not deviate on screens 1, 2, 3, 8 — these are the demo backbone.

---

## 11. AUTHENTICATION

- Single guard, single role: IT Staff. No employee-facing login.
- Use Laravel's built-in `Auth` scaffolding (Breeze pattern is acceptable if it doesn't conflict with the Inertia+React setup already chosen) — do not build custom auth from scratch given time constraints.
- No email verification, no password reset flow required for MVP — a seeded staff account is sufficient for the demo.

---

## 12. NON-FUNCTIONAL REQUIREMENTS

- **Explainability (binding, from Constraint #2):** every AI-influenced output shown to a user MUST be accompanied by a human-readable rationale string. No bare score or bare recommendation without explanation.
- **Determinism of core logic:** `MatchingService` must produce identical output given identical input, every time. No randomness, no live AI calls inside this class.
- **Graceful degradation:** if `GeminiService` fails (network, quota, malformed response), the Match Request screen MUST fall back to a manual requirement-entry form (the same shape as §7.3) rather than blocking the user entirely.
- **Seed data:** `DatabaseSeeder` must populate 20–30 devices spanning all `cpu_tier`/`gpu_tier` combinations, 4–6 role profiles, and 10–15 employees (some with active assignments, including at least 2–3 intentional mismatches) so the mismatch detector and dashboard have something to show on first run.

---

## 13. TRACEABILITY — CONSTRAINTS TO DESIGN DECISIONS

| Contest Constraint | Satisfied by |
|---|---|
| Existing inventory considered before new purchases | §8.5 threshold rule — procurement only suggested when no device clears `MATCH_THRESHOLD` |
| Understandable, objective reasoning | §7.3 `reasoning` field (Layer 1) + §8.6 `rationale` string (Layer 2), both shown in UI |
| Different specs and requirements considered | §9.1/§9.2 schema covers CPU tier, RAM, storage, GPU tier, and portability as first-class fields |

---

## 14. PROJECT INITIALIZATION — STEP BY STEP (Antigravity IDE, repo already created)


### Install Laravel 12
```bash
composer create-project laravel/laravel:^12.0 temp-app
```
Then merge `temp-app/*` (including hidden files like `.env.example`, `.gitignore`) into the repo root, excluding `temp-app/.git`. Delete `temp-app` afterward.

Verify:
```bash
php artisan --version
```
Should report Laravel Framework 12.x.

### Install Inertia.js (server-side, Laravel adapter)
```bash
composer require inertiajs/inertia-laravel
php artisan inertia:middleware
```
Register the `HandleInertiaRequests` middleware in `bootstrap/app.php` (Laravel 12's middleware registration is done there, not `Kernel.php`) — add it to the `web` middleware group.

### Install React + Inertia client-side
Laravel 12 uses Vite. Install the frontend pieces:
```bash
npm install @inertiajs/react react react-dom
npm install -D @vitejs/plugin-react
```
Update `vite.config.js` to include the React plugin alongside the Laravel plugin. Set up `resources/js/app.jsx` as the Inertia entry point (createInertiaApp), and adjust `resources/views/app.blade.php` to be the single Inertia root view (`@inertia` directive, no other Blade page templates needed — Inertia owns all page rendering from here).

### Set up MySQL
Create the database (name suggestion: `specmatch`):
```sql
CREATE DATABASE specmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
In `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=specmatch
DB_USERNAME=<local mysql user>
DB_PASSWORD=<local mysql password>
```
Copy `.env.example` to `.env` first if not already present, then `php artisan key:generate`.

### 14.6 Auth scaffolding
```bash
composer require laravel/breeze --dev
php artisan breeze:install react
```
This installs a React+Inertia-compatible auth scaffold directly — saves rebuilding login from scratch, satisfies §11.

### 14.7 Gemini setup
```bash
composer require google-gemini-php/laravel
```
(Or use Guzzle directly against the Gemini REST endpoint inside `GeminiService` if the package proves troublesome mid-hackathon — do not lose more than 30 minutes to a package integration issue; a raw HTTP client call is an acceptable fallback.)

Add to `.env`:
```
GEMINI_API_KEY=<key>
```

### Git — connect and first commit
If the repo was cloned in §14.1, origin is already set. Otherwise:
```bash
git remote add origin https://github.com/meloervy/appcon2026-codetitans-specmatch.git
```
First commit (do this immediately after scaffolding, before writing feature code — satisfies the AppCon commit-history requirement from the moment development starts):
```bash
git add .
git commit -m "Initial Laravel 12 + Inertia + React scaffold, MySQL config"
git push -u origin main
```

### Migrations and seeders (write these first, per §9 and §12)
```bash
php artisan make:migration create_devices_table
php artisan make:migration create_role_profiles_table
php artisan make:migration create_employees_table
php artisan make:migration create_assignments_table
php artisan make:migration create_match_requests_table
php artisan make:model Device
php artisan make:model RoleProfile
php artisan make:model Employee
php artisan make:model Assignment
php artisan make:model MatchRequest
php artisan make:seeder DatabaseSeeder
```
Fill migrations per §9.1–§9.5 exactly, run:
```bash
php artisan migrate --seed
```

### Verify the stack end-to-end before splitting into feature work
```bash
php artisan serve
npm run dev
```
Confirm a blank Inertia+React page renders at `/` before anyone starts building feature screens. This is the Day 1, Hour 1 checkpoint — nobody starts on §10 screens until this passes.

---

## 15. FILE/FOLDER CONVENTIONS (for AI-generated code consistency)

- Controllers: `app/Http/Controllers/{Entity}Controller.php` (e.g. `DeviceController.php`)
- Services: `app/Services/{Name}Service.php`
- Models: `app/Models/{Entity}.php` (singular)
- React pages: `resources/js/Pages/{Entity}/{Action}.jsx` (e.g. `resources/js/Pages/Devices/Index.jsx`)
- Shared React components: `resources/js/Components/`
- Form requests (validation): `app/Http/Requests/{Entity}/{Action}Request.php`

---

## 16. GLOSSARY OF ENUM VALUES (copy exactly, case-sensitive)

- `cpu_tier` / `min_cpu_tier`: `entry`, `mid`, `high`, `workstation`
- `gpu_tier` / `min_gpu_tier`: `none`, `integrated`, `dedicated-entry`, `dedicated-high`
- `device_type`: `laptop`, `desktop`
- `storage_type`: `HDD`, `SSD`
- `condition`: `excellent`, `good`, `fair`, `needs_repair`, `retired`
- `status` (devices): `available`, `assigned`, `in_repair`, `retired`
- `assignment_source`: `ai_recommended`, `manual_override`