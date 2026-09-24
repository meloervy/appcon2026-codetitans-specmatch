# SpecMatch — Collaborator & Developer Guide

Welcome to **SpecMatch**! This guide details everything you need to set up, run, develop, and test the project locally.

---

## 1. Project Overview

SpecMatch is an intelligent internal device asset optimization web application designed for IT departments. It addresses hardware fragmentation, unclear device-selection criteria, and underutilized inventory by pairing employee requirements with available company devices using a two-layer matching engine:
1. **Layer 1 (AI Requirement Extraction)**: Converts unstructured text requests into a standardized hardware requirement schema using Google Gemini.
2. **Layer 2 (Deterministic Scoring & Ranking)**: Applies an objective weighted scoring formula across CPU, RAM, storage, GPU, and portability, strictly checking company inventory first before recommending procurement.
3. **Mismatch Radar**: Scans active hardware assignments to identify under-provisioned performance bottlenecks and over-provisioned fleet waste.

---

## 2. Technology Stack

- **Backend**: Laravel 13 (PHP 8.4+)
- **Frontend**: React 18 with Inertia.js v2
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Database**: MySQL 8.0+
- **Build Tool**: Vite 8 with Rolldown / OXC (requires Node 20.19+ or Node 22)
- **AI Integration**: Google Gemini API (with built-in heuristic fallback)

---

## 3. Prerequisites

Ensure you have the following installed on your local environment:
- **PHP**: `>= 8.3` (Recommended: `8.4.x`) with `pdo_mysql`, `mbstring`, `openssl`, `bcmath`.
- **Composer**: `>= 2.8.x`
- **Node.js**: `>= 22.x` (Recommended: Node 22 LTS). Use `nvm` to switch:
  ```bash
  nvm use 22
  ```
- **MySQL**: 8.0+ running on `127.0.0.1:3306` (or Docker).

---

## 4. Local Setup Step-by-Step

### 1. Clone the Repository
```bash
git clone https://github.com/meloervy/appcon2026-codetitans-specmatch.git
cd appcon2026-codetitans-specmatch
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure the database settings in `.env` match your local MySQL server:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=specmatch
DB_USERNAME=root
DB_PASSWORD=

# Optional: Add your Gemini API key (the system has an automatic heuristic fallback if left empty)
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: Google Custom Search API for hardware image search (public local assets used as fallback)
GOOGLE_SEARCH_API_KEY=
GOOGLE_SEARCH_ENGINE_ID=
```

### 3. Install PHP Dependencies
```bash
composer install
```

### 4. Generate Application Key
```bash
php artisan key:generate
```

### 5. Create Database & Seed Initial Data
Create the MySQL database if it does not already exist:
```sql
CREATE DATABASE IF NOT EXISTS specmatch CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Run migrations and seeders:
```bash
php artisan migrate:fresh --seed
```

### 6. Install Frontend Dependencies
```bash
# Pin to Node 22 (or run: source ~/.nvm/nvm.sh && nvm use 22)
nvm use
npm install
```

---

## 5. Running the Application Locally

Run the development servers in two separate terminal windows:

### Terminal 1 — Laravel Server:
```bash
php artisan serve
```
The app will be accessible at: **`http://127.0.0.1:8000`**

### Terminal 2 — Vite Dev Server (Hot Module Reloading):
```bash
nvm use 22
npm run dev
```

*(Alternatively, to build static assets for production):*
```bash
npm run build
```

---

## 6. Default Credentials

The database seeder creates an IT Administrator account:

| Role | Email | Password |
|---|---|---|
| **IT Administrator** | `admin@specmatch.local` | `password` |

---

## 7. Key Features & How to Test

### 1. Dashboard (`/dashboard`)
- **Fleet Metrics**: Total active units, available/idle units, assigned units, in-repair units.
- **Utilization Rate**: Real-time gauge of assigned vs idle devices.
- **Mismatch Alert Banner**: Highlights active assignments failing role benchmarks.
- **Procurement Avoidance Savings**: Displays dollar savings calculated from reusing existing inventory.
- **Available Fleet & Recent Trail**: Quick cards for idle devices and recent assignment history.

### 2. Hardware Inventory (`/devices`)
- **Search & Filter**: Search by asset tag, brand, model, CPU, or filter by status, device type, CPU tier, and condition.
- **Register New Unit** (`/devices/create`): Add new laptops or desktops to the fleet with full specifications.
- **Device Details & History** (`/devices/{id}`): View hardware profile, current assignment, past assignment history, edit specifications, or retire a unit.

### 2. IT Asset Identification & Gemini AI Auto-Fill (`/devices/create`)
- **Automated Specification Lookup**: Uses Google Gemini 3.1 Flash-Lite to parse device names and infer authoritative hardware specs (CPU, GPU, RAM, Storage, Form Factor).
- **1-Click Auto-Fill**: Automatically parses and fills brand, model, CPU, CPU tier, RAM, storage size/type, GPU, GPU tier, and release year with smart fallback heuristics.
- **Hardware Image Resolution**: Automatically resolves authentic device photos from the local curated hardware asset library (`public/images/devices/`) or Google Image Search.
- **Redundancy Optimization**: Highlights unassigned high-spec devices in pool inventory to optimize utilization and avoid duplicate procurement.

### 3. Continuous ITAM Tracking (Financial, Contractual, Inventory)
- **Financial Tracking**: Tracks initial purchase cost, annual straight-line depreciation rate (%), and computes live residual book value for every machine.
- **Contractual Data**: Tracks vendor sources, warranty start/expiration dates, and enterprise Service-Level Agreements (SLAs).
- **Warranty Alert Radar**: Highlights warranties expiring in &le; 60 days on the dashboard.
- **Physical Inventory**: Authoritative tracking for serial numbers, barcodes, QR tags, and physical room/office locations.

### 4. IT Asset Lifecycle Stages (`/devices/{id}`)
- **Visual Lifecycle Stepper**: Displays progressive asset journey across 4 distinct phases:
  1. **Acquisition**: Procurement intake, imaging, and staging.
  2. **Deployment**: Active in-service production fleet.
  3. **Maintenance**: Scheduled servicing, diagnostics, and repairs.
  4. **Retirement**: End-of-life decommissioned, sanitized, and recycled.
- **Audit Event Logging**: Records an immutable audit trail whenever an asset transitions lifecycle stages, capturing the timestamp, authorized user, and justification notes.

### 5. Maintenance & Servicing Management (`/maintenance`)
- **Activity Logging**: Log repairs, hardware upgrades (e.g. RAM, SSD), preventive servicing, inspections, and replacements with vendor/technician info and costs.
- **Performance Assessments**: Assess post-servicing asset performance (thermal dissipation improvements, PassMark scores, memory stability) to verify operational capability before returning to deployment.

### 6. Role & Workload Profiles (`/role-profiles`)
- Standardized templates defining hardware expectations for job roles (e.g. Software Engineer, Video Designer, Data Analyst, Admin Staff, Sales, AI Researcher).
- Includes CPU tier, minimum RAM, minimum storage, GPU requirements, and portability need.

### 7. Employee Directory (`/employees`)
- View all staff members, their departments, assigned role profiles, and currently issued devices.
- Direct "Reassign" and "Unassign" actions.

### 8. AI Matching Engine (`/match`)
- **Layer 1 (AI Extraction)**: Enter a natural language request (e.g. *"New video editor needing to render 4K video and travel frequently"*). Click **Extract Requirements** to parse it into structured JSON with Gemini's reasoning.
- **Manual Adjustments**: Refine CPU tier, RAM, storage, GPU, or portability before scoring.
- **Layer 2 (Deterministic Scoring)**: Ranks eligible available devices using the weighted formula:
  $$\text{Score} = (0.30 \times \text{CPU}) + (0.25 \times \text{RAM}) + (0.15 \times \text{Storage}) + (0.20 \times \text{GPU}) + (0.10 \times \text{Portability})$$
- **Explainable Rationale**: Every device card includes a plain-language explanation of why it scored high or low.
- **Procurement Recommendation**: If no existing unit achieves $\ge 0.65$ score, an alert banner recommends procurement, strictly adhering to Constraint #1 (inventory first).
- **Assign Action**: One-click atomic assignment directly updates device and employee status.

### 9. Assignment Mismatch Radar (`/mismatches`)
- Audits active assignments against their employee's role profile.
- Flags mismatches into **Under-Provisioned** (insufficient specs) or **Over-Provisioned** (hardware fleet waste).
- Includes 3 pre-seeded demo test cases:
  1. *Carla Diaz* (Video Editor) on an entry-level laptop &rarr; Flagged as Under-Provisioned (10% score).
  2. *Grace Hopper* (Admin Staff) on an extreme Xeon/RTX 6000 Ada workstation &rarr; Flagged as Over-Provisioned (56% score).
  3. *Isabella Gomez* (Field Sales) on an OptiPlex desktop with HDD &rarr; Flagged as Under-Provisioned / Zero Mobility (33% score).
- Click **Find Replacement Device** to launch the matching pipeline pre-filled for that employee.

---

## 8. Testing & Code Quality

Run the automated test suite:
```bash
php artisan test
```

Current test suite status:
- **45 tests passing (163 assertions)** covering:
  - ITAM tracking (financial depreciation calculations, residual book values, and warranty alerts)
  - Lifecycle stage progression and audit event logging
  - Maintenance servicing logs and post-repair performance assessment recording
  - AI device specification extraction and hardware image resolution
  - MatchingService scoring formula and subscores
  - Eligibility filters (GPU and availability checks)
  - Procurement threshold logic
  - Single active assignment transactional invariant
  - GeminiService extraction and heuristic fallback
  - Device CRUD and retirement
  - Dashboard metrics and mismatch radar integration
  - Authentication and profile flows

---

## 9. Codebase Architecture & File Structure

```
app/
├── Http/
│   └── Controllers/
│       ├── DashboardController.php      # Fleet stats & ITAM financial valuations
│       ├── DeviceController.php         # Hardware inventory CRUD & lifecycle transitions
│       ├── EmployeeController.php       # Staff directory & unassign actions
│       ├── HardwareImageController.php  # Authentic photo lookup (public assets / Google Image)
│       ├── MaintenanceController.php    # Central servicing logs & performance assessments
│       ├── MatchingController.php       # Layer 1 extraction & Layer 2 ranking
│       ├── MismatchController.php       # Fleet audit & mismatch radar
│       └── RoleProfileController.php    # Workload specification templates
├── Models/
│   ├── Assignment.php                   # Hardware-to-employee relationship
│   ├── Device.php                       # Hardware specifications & ITAM state
│   ├── Employee.php                     # Staff member records
│   ├── LifecycleEvent.php               # Audit trail of lifecycle transitions
│   ├── MaintenanceLog.php               # Servicing, repairs, & performance assessments
│   ├── MatchRequest.php                 # Log of matching pipeline runs
│   └── RoleProfile.php                  # Workload template specifications
└── Services/
    ├── GeminiService.php                # Layer 1: AI text-to-spec extractor & hardware auto-fill
    ├── HardwareImageService.php         # Image resolution from local public assets & Google Search
    ├── ItamTrackingService.php          # Straight-line depreciation, residual values, & warranty alerts
    └── MatchingService.php              # Layer 2: Deterministic scoring & mismatch detector

resources/js/
├── Layouts/
│   └── AuthenticatedLayout.jsx       # Global navbar, navigation, and flash alerts
└── Pages/
    ├── Dashboard/Index.jsx           # Operations dashboard & ITAM financial health
    ├── Devices/                      # Inventory data tables, creation, & show views
    ├── Employees/Index.jsx           # Staff directory & assignment status
    ├── Maintenance/Index.jsx         # Central ITAM maintenance & repair tracking hub
    ├── Match/Request.jsx             # AI matching pipeline & recommendation cards
    ├── Mismatches/Index.jsx          # Mismatch radar & discrepancy audit
    └── RoleProfiles/Index.jsx        # Role profile templates & editor
```

---

## 10. Collaboration Conventions

- **Branching**: Create feature branches from `main` (`git checkout -b feature/your-feature-name`).
- **Commits**: Use conventional commits (e.g. `feat:`, `fix:`, `docs:`, `test:`).
- **Frontend**: Keep all styling aligned with Tailwind CSS v4 utility classes.
- **Controllers**: Keep controllers thin; place complex calculations in dedicated Service classes.
- **Verification**: Always run `php artisan test` and `npm run build` before pushing.
