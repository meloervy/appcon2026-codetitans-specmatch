<?php

namespace App\Services;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\LifecycleEvent;
use Illuminate\Support\Facades\DB;

class MatchingService
{
    public const MATCH_THRESHOLD = 0.65;

    public const CPU_TIERS = [
        'entry' => 1,
        'mid' => 2,
        'high' => 3,
        'workstation' => 4,
    ];

    public const GPU_TIERS = [
        'none' => 0,
        'integrated' => 1,
        'dedicated-entry' => 2,
        'dedicated-high' => 3,
    ];

    /**
     * Estimate new replacement procurement value of a device in Philippine Peso (₱).
     */
    public function estimateDeviceValuePhp(Device $device): float
    {
        if ($device->purchase_cost && $device->purchase_cost > 0) {
            return (float) $device->purchase_cost;
        }

        if ($device->cpu_tier === 'workstation') {
            return 185000.00;
        }
        if ($device->cpu_tier === 'high') {
            return $device->device_type === 'laptop' ? 120000.00 : 95000.00;
        }
        if ($device->cpu_tier === 'mid') {
            return $device->device_type === 'laptop' ? 65000.00 : 45000.00;
        }

        return $device->device_type === 'laptop' ? 32000.00 : 25000.00;
    }

    /**
     * Score every eligible device against requirements and return ranked list.
     *
     * @return array{results: array, procurement_recommended: bool, total_capex_savings_php: float, threshold: float}
     */
    public function rankDevices(array $requirements, ?int $excludeDeviceId = null, bool $availableOnly = true): array
    {
        $query = Device::query();

        if ($excludeDeviceId) {
            $query->where('id', '!=', $excludeDeviceId);
        }

        $devices = $query->get();
        $ranked = [];
        $hasEligibleAboveThreshold = false;
        $totalCapexSavings = 0.0;

        foreach ($devices as $device) {
            $evaluation = $this->evaluateDevice($device, $requirements, $availableOnly);
            $ranked[] = $evaluation;

            if (! $evaluation['disqualified'] && $evaluation['score'] >= self::MATCH_THRESHOLD) {
                $hasEligibleAboveThreshold = true;
                $totalCapexSavings = max($totalCapexSavings, $evaluation['capex_saved_php']);
            }
        }

        // Sort descending by score; qualified devices first
        usort($ranked, function ($a, $b) {
            if ($a['disqualified'] !== $b['disqualified']) {
                return $a['disqualified'] ? 1 : -1;
            }

            return $b['score'] <=> $a['score'];
        });

        return [
            'results' => $ranked,
            'procurement_recommended' => ! $hasEligibleAboveThreshold,
            'total_capex_savings_php' => $totalCapexSavings,
            'threshold' => self::MATCH_THRESHOLD,
        ];
    }

    /**
     * Evaluate a single device against a set of requirements.
     */
    public function evaluateDevice(Device $device, array $requirements, bool $availableOnly = false): array
    {
        $requiresGpu = ! empty($requirements['requires_gpu']);
        $reqGpuTier = $requirements['min_gpu_tier'] ?? 'none';
        $portabilityRequired = ! empty($requirements['portability_required']);

        // Hard eligibility filter (doc.md §8.3)
        $disqualified = false;
        $disqualificationReason = null;

        if ($availableOnly && $device->status !== 'available') {
            $disqualified = true;
            $disqualificationReason = "Device status is '{$device->status}' (requires available).";
        } elseif ($requiresGpu && $device->gpu_tier === 'none') {
            $disqualified = true;
            $disqualificationReason = 'Workload requires dedicated or integrated GPU, but device has no GPU.';
        }

        // Calculate sub-scores (0.0 to 1.0)
        $cpuScore = $this->scoreCpuTier($device->cpu_tier, $requirements['min_cpu_tier'] ?? 'entry');
        $ramScore = $this->scoreRam($device->ram_gb, (int) ($requirements['min_ram_gb'] ?? 8));
        $storageScore = $this->scoreStorage($device->storage_gb, (int) ($requirements['min_storage_gb'] ?? 256));
        $gpuScore = $this->scoreGpu($device->gpu_tier, $requiresGpu, $reqGpuTier);
        $portabilityScore = $this->scorePortability($device->device_type, $portabilityRequired);

        // Weighted base total (doc.md §8.4)
        $baseScore = ($cpuScore * 0.30)
               + ($ramScore * 0.25)
               + ($storageScore * 0.15)
               + ($gpuScore * 0.20)
               + ($portabilityScore * 0.10);

        // Refined ITAM Modifiers:
        // 1. Condition adjustment (+0.02 for excellent/good, -0.05 for fair, -0.15 for poor)
        $conditionMod = match (strtolower($device->condition ?? 'good')) {
            'new', 'excellent' => 0.02,
            'good' => 0.01,
            'fair' => -0.04,
            'poor', 'degraded' => -0.15,
            default => 0.0,
        };

        // 2. Lifecycle adjustment (+0.02 for operational, -0.15 for maintenance)
        $lifecycleMod = match (strtolower($device->lifecycle_stage ?? 'operational')) {
            'operational' => 0.02,
            'maintenance' => -0.15,
            'retired', 'disposed' => -0.30,
            default => 0.0,
        };

        $finalScore = max(0.0, min(1.0, round($baseScore + $conditionMod + $lifecycleMod, 3)));

        // Component breakdown meters (0-100%)
        $componentMeters = [
            'cpu' => (int) round($cpuScore * 100),
            'ram' => (int) round($ramScore * 100),
            'storage' => (int) round($storageScore * 100),
            'gpu' => (int) round($gpuScore * 100),
            'portability' => (int) round($portabilityScore * 100),
            'condition' => match (strtolower($device->condition ?? 'good')) {
                'new', 'excellent' => 100,
                'good' => 90,
                'fair' => 65,
                default => 40,
            },
        ];

        // CapEx Savings in PHP (reusing existing idle unit saves replacement procurement)
        $capexSavedPhp = ! $disqualified ? $this->estimateDeviceValuePhp($device) : 0.0;

        // Fit Grade
        $fitGrade = match (true) {
            $disqualified => 'Disqualified',
            $finalScore >= 0.88 => 'Optimal Fit',
            $finalScore >= 0.72 => 'Capable Match',
            $finalScore >= self::MATCH_THRESHOLD => 'Marginal Fit',
            default => 'Under-Provisioned',
        };

        $overprovisioningRisk = false;
        if (! $disqualified && ($device->ram_gb >= ($requirements['min_ram_gb'] ?? 8) * 2 && $device->ram_gb > 16)) {
            $overprovisioningRisk = true;
        }

        $subscores = [
            'cpu' => round($cpuScore, 3),
            'ram' => round($ramScore, 3),
            'storage' => round($storageScore, 3),
            'gpu' => round($gpuScore, 3),
            'portability' => round($portabilityScore, 3),
        ];

        $rationale = $this->generateRationale($device, $requirements, $subscores, $disqualified, $disqualificationReason);

        return [
            'device' => $device,
            'score' => $finalScore,
            'base_score' => round($baseScore, 3),
            'subscores' => $subscores,
            'component_meters' => $componentMeters,
            'capex_saved_php' => $capexSavedPhp,
            'fit_grade' => $fitGrade,
            'overprovisioning_risk' => $overprovisioningRisk,
            'rationale' => $rationale,
            'disqualified' => $disqualified,
            'disqualification_reason' => $disqualificationReason,
            'passes_threshold' => ! $disqualified && ($finalScore >= self::MATCH_THRESHOLD),
            'is_available_for_deployment' => ($device->status === 'available'),
            'deployment_readiness' => ($device->status === 'available' ? 'Stockroom Ready (Immediate Dispatch)' : 'Currently Assigned'),
        ];
    }

    private function scoreCpuTier(string $deviceTier, string $requiredTier): float
    {
        $devVal = self::CPU_TIERS[$deviceTier] ?? 1;
        $reqVal = self::CPU_TIERS[$requiredTier] ?? 1;
        $diff = $devVal - $reqVal;

        if ($diff === 0) {
            return 1.0;
        }
        if ($diff === 1) {
            return 0.8; // One tier above (discourages over-provisioning)
        }
        if ($diff === 2) {
            return 0.4;
        }
        if ($diff > 2) {
            return 0.2;
        }

        return 0.0; // Below requirement
    }

    private function scoreRam(int $deviceRam, int $requiredRam): float
    {
        if ($requiredRam <= 0) {
            return 1.0;
        }

        // Tolerance band: within 2GB
        if (abs($deviceRam - $requiredRam) <= 2) {
            return 1.0;
        }
        if ($deviceRam > $requiredRam) {
            return 0.85; // Exceeds requirement
        }

        // Linear falloff toward 0.0 reaching 0.0 at requiredRam * 0.5
        $zeroPoint = $requiredRam * 0.5;
        if ($deviceRam <= $zeroPoint) {
            return 0.0;
        }

        return max(0.0, min(1.0, ($deviceRam - $zeroPoint) / ($requiredRam - $zeroPoint)));
    }

    private function scoreStorage(int $deviceStorage, int $requiredStorage): float
    {
        if ($requiredStorage <= 0) {
            return 1.0;
        }

        // Tolerance band: within 64GB
        if (abs($deviceStorage - $requiredStorage) <= 64) {
            return 1.0;
        }
        if ($deviceStorage > $requiredStorage) {
            return 0.85;
        }

        $zeroPoint = $requiredStorage * 0.5;
        if ($deviceStorage <= $zeroPoint) {
            return 0.0;
        }

        return max(0.0, min(1.0, ($deviceStorage - $zeroPoint) / ($requiredStorage - $zeroPoint)));
    }

    private function scoreGpu(string $deviceGpuTier, bool $requiresGpu, string $minGpuTier): float
    {
        $devVal = self::GPU_TIERS[$deviceGpuTier] ?? 0;
        $reqVal = self::GPU_TIERS[$minGpuTier] ?? 0;

        if (! $requiresGpu) {
            if ($devVal === 0) {
                return 1.0; // No GPU needed, no GPU present (no waste)
            }
            if ($devVal === 1) {
                return 0.9; // Integrated GPU is fine for non-GPU roles
            }

            return 0.3; // Dedicated GPU when not needed flags over-provisioning waste
        }

        // GPU is required
        if ($devVal === 0) {
            return 0.0;
        }
        if ($devVal === $reqVal) {
            return 1.0;
        }
        if ($devVal > $reqVal) {
            return 0.7; // Exceeds requirement
        }

        return 0.0; // Below requirement
    }

    private function scorePortability(string $deviceType, bool $portabilityRequired): float
    {
        if ($portabilityRequired) {
            return ($deviceType === 'laptop') ? 1.0 : 0.0;
        }

        // Portability not required
        return ($deviceType === 'desktop') ? 1.0 : 0.6; // Laptop is usable but suboptimal allocation for desk-bound roles
    }

    private function generateRationale(Device $device, array $requirements, array $subscores, bool $disqualified, ?string $reason): string
    {
        if ($disqualified) {
            return 'Disqualified: '.($reason ?? 'Hard requirement filter failed.');
        }

        $parts = [];

        // CPU
        if ($subscores['cpu'] >= 1.0) {
            $parts[] = "Matches required CPU tier ({$device->cpu_tier})";
        } elseif ($subscores['cpu'] >= 0.8) {
            $parts[] = "CPU tier ({$device->cpu_tier}) exceeds request";
        } elseif ($subscores['cpu'] > 0.0) {
            $parts[] = "CPU tier ({$device->cpu_tier}) is significantly above requirement";
        } else {
            $parts[] = "CPU tier ({$device->cpu_tier}) falls below requested ({$requirements['min_cpu_tier']})";
        }

        // RAM
        if ($subscores['ram'] >= 1.0) {
            $parts[] = "RAM ({$device->ram_gb}GB) meets target specification";
        } elseif ($subscores['ram'] >= 0.85) {
            $parts[] = "RAM ({$device->ram_gb}GB) exceeds minimum";
        } else {
            $parts[] = "RAM ({$device->ram_gb}GB) is below requested {$requirements['min_ram_gb']}GB";
        }

        // Storage
        if ($subscores['storage'] >= 1.0) {
            $parts[] = "Storage ({$device->storage_gb}GB {$device->storage_type}) matches capacity";
        } elseif ($subscores['storage'] >= 0.85) {
            $parts[] = "Storage ({$device->storage_gb}GB) provides generous headroom";
        } else {
            $parts[] = "Storage ({$device->storage_gb}GB) is below target";
        }

        // GPU
        if ($subscores['gpu'] >= 1.0) {
            $parts[] = 'GPU configuration perfectly aligns with workload';
        } elseif ($subscores['gpu'] >= 0.7) {
            $parts[] = "GPU ({$device->gpu_tier}) exceeds required tier";
        } elseif ($subscores['gpu'] == 0.3) {
            $parts[] = "Dedicated GPU ({$device->gpu_tier}) on non-GPU role represents potential over-provisioning";
        } else {
            $parts[] = "GPU ({$device->gpu_tier}) insufficient for graphical needs";
        }

        // Portability
        if ($subscores['portability'] >= 1.0) {
            $parts[] = "Form factor ({$device->device_type}) matches mobility preference";
        } elseif ($subscores['portability'] == 0.6) {
            $parts[] = 'Laptop assigned to desk role (acceptable but consumes mobile inventory)';
        } else {
            $parts[] = 'Desktop assigned when portability was requested';
        }

        // Condition & CapEx FinOps Note
        if (in_array(strtolower($device->condition ?? ''), ['good', 'excellent', 'new'])) {
            $parts[] = "Unit in {$device->condition} physical condition";
        }
        $valFormatted = number_format($this->estimateDeviceValuePhp($device), 0);
        $parts[] = "Reallocation avoids ~₱{$valFormatted} CapEx procurement";

        return implode('. ', $parts).'.';
    }

    /**
     * Scan active assignments for mismatches against employee role profiles.
     */
    public function detectMismatches(): array
    {
        $assignments = Assignment::with(['device', 'employee.roleProfile'])
            ->whereNull('unassigned_at')
            ->get();

        $mismatches = [];

        foreach ($assignments as $assignment) {
            $employee = $assignment->employee;
            $device = $assignment->device;

            if (! $employee || ! $employee->roleProfile || ! $device) {
                continue;
            }

            $profile = $employee->roleProfile;
            $requirements = [
                'min_cpu_tier' => $profile->min_cpu_tier,
                'min_ram_gb' => $profile->min_ram_gb,
                'min_storage_gb' => $profile->min_storage_gb,
                'requires_gpu' => $profile->requires_gpu,
                'min_gpu_tier' => $profile->min_gpu_tier ?? 'none',
                'portability_required' => $profile->portability_required,
            ];

            $eval = $this->evaluateDevice($device, $requirements, false);

            if ($eval['disqualified'] || $eval['score'] < self::MATCH_THRESHOLD) {
                // Classify mismatch type (doc.md §8.7)
                $isUnder = false;
                if ($eval['subscores']['cpu'] == 0.0 ||
                    $eval['subscores']['ram'] < 0.6 ||
                    $eval['subscores']['storage'] < 0.6 ||
                    ($profile->requires_gpu && $eval['subscores']['gpu'] < 0.5) ||
                    ($profile->portability_required && $eval['subscores']['portability'] == 0.0)) {
                    $isUnder = true;
                }

                $mismatches[] = [
                    'assignment' => $assignment,
                    'device' => $device,
                    'employee' => $employee,
                    'role_profile' => $profile,
                    'score' => $eval['score'],
                    'subscores' => $eval['subscores'],
                    'classification' => $isUnder ? 'under-provisioned' : 'over-provisioned',
                    'rationale' => $eval['rationale'],
                    'disqualified' => $eval['disqualified'],
                    'disqualification_reason' => $eval['disqualification_reason'],
                ];
            }
        }

        return $mismatches;
    }

    /**
     * Atomically assign a device to an employee, enforcing single-active invariant.
     *
     * @param  string  $source  ('ai_recommended' | 'manual_override')
     */
    public function assignDevice(int $deviceId, int $employeeId, string $source = 'manual_override', ?float $score = null): Assignment
    {
        return DB::transaction(function () use ($deviceId, $employeeId, $source, $score) {
            $now = now();

            // 1. Unassign prior active assignment for this device
            Assignment::where('device_id', $deviceId)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => $now]);

            // 2. Unassign prior active assignment for this employee
            Assignment::where('employee_id', $employeeId)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => $now]);

            // 3. Mark device as assigned
            $device = Device::findOrFail($deviceId);
            $device->update(['status' => 'assigned']);

            // 4. Create new assignment
            return Assignment::create([
                'device_id' => $deviceId,
                'employee_id' => $employeeId,
                'assigned_at' => $now,
                'unassigned_at' => null,
                'match_score' => $score,
                'assignment_source' => $source,
            ]);
        });
    }

    /**
     * Unassign a device from an active assignment.
     */
    public function unassignDevice(int $assignmentId): void
    {
        DB::transaction(function () use ($assignmentId) {
            $assignment = Assignment::findOrFail($assignmentId);
            $assignment->update(['unassigned_at' => now()]);

            $device = $assignment->device;
            if ($device && $device->status === 'assigned') {
                $device->update(['status' => 'available']);
            }
        });
    }

    /**
     * Find dynamic bridge swap opportunities when direct matching cannot fulfill high-end requirements
     * or to optimize overprovisioned active fleet units.
     *
     * @param  array  $requirements  Requirements requested by/for the requester
     * @param  int|null  $requesterEmployeeId  The employee who will receive the high-end donor device
     */
    public function findBridgeSwaps(array $requirements, ?int $requesterEmployeeId = null): array
    {
        $requester = $requesterEmployeeId ? Employee::with('roleProfile')->find($requesterEmployeeId) : null;
        $requesterLocation = $requester?->location;

        // 1. Get available stockroom units that can serve as a bridge
        $availableDevices = Device::available()
            ->where('condition', '!=', 'poor')
            ->where('condition', '!=', 'needs_repair')
            ->get();

        if ($availableDevices->isEmpty()) {
            return [];
        }

        // 2. Find active assignments where the assigned device fulfills the requester's requirements
        $activeAssignments = Assignment::with(['device', 'employee.roleProfile'])
            ->whereNull('unassigned_at')
            ->when($requesterEmployeeId, fn ($q) => $q->where('employee_id', '!=', $requesterEmployeeId))
            ->get();

        $candidates = [];

        foreach ($activeAssignments as $assignment) {
            $donor = $assignment->employee;
            $donorDevice = $assignment->device;

            if (! $donor || ! $donor->roleProfile || ! $donorDevice) {
                continue;
            }

            // A. Evaluate donor device against Requester requirements
            $requesterEval = $this->evaluateDevice($donorDevice, $requirements, false);
            if ($requesterEval['disqualified'] || $requesterEval['score'] < self::MATCH_THRESHOLD) {
                continue;
            }

            // B. Check if donor is overprovisioned for their actual role
            $donorProfile = $donor->roleProfile;
            $donorRequirements = [
                'min_cpu_tier' => $donorProfile->min_cpu_tier,
                'min_ram_gb' => $donorProfile->min_ram_gb,
                'min_storage_gb' => $donorProfile->min_storage_gb,
                'requires_gpu' => $donorProfile->requires_gpu,
                'min_gpu_tier' => $donorProfile->min_gpu_tier ?? 'none',
                'portability_required' => $donorProfile->portability_required,
            ];

            $donorCpuDiff = (self::CPU_TIERS[$donorDevice->cpu_tier] ?? 1) - (self::CPU_TIERS[$donorProfile->min_cpu_tier] ?? 1);
            $donorRamDiff = $donorDevice->ram_gb - $donorProfile->min_ram_gb;

            // Only consider donors whose device noticeably exceeds their required specs
            $isOverprovisioned = ($donorCpuDiff > 0 || $donorRamDiff >= 8 || ($donorDevice->gpu_tier !== 'none' && ! $donorProfile->requires_gpu));
            if (! $isOverprovisioned) {
                continue;
            }

            // C. Find the best available stockroom device that satisfies the donor's role requirements
            $bestBridgeDevice = null;
            $bestBridgeScore = 0.0;

            foreach ($availableDevices as $bridgeDevice) {
                $bridgeEval = $this->evaluateDevice($bridgeDevice, $donorRequirements, true);

                if (! $bridgeEval['disqualified'] && $bridgeEval['score'] >= self::MATCH_THRESHOLD) {
                    if ($bridgeEval['score'] > $bestBridgeScore) {
                        $bestBridgeScore = $bridgeEval['score'];
                        $bestBridgeDevice = $bridgeDevice;
                    }
                }
            }

            if (! $bestBridgeDevice) {
                continue;
            }

            // D. Calculate feasibility score & CapEx savings
            $isSameLocation = ($donorDevice->location && $bestBridgeDevice->location && strtolower($donorDevice->location) === strtolower($bestBridgeDevice->location));
            $locationBonus = $isSameLocation ? 0.08 : 0.0;
            $conditionBonus = $donorDevice->condition === 'excellent' ? 0.05 : ($donorDevice->condition === 'good' ? 0.02 : 0.0);

            $compositeScore = round(
                (($requesterEval['score'] * 0.55) + ($bestBridgeScore * 0.45) + $locationBonus + $conditionBonus),
                3
            );
            $compositeScore = min(0.99, max(0.65, $compositeScore));

            $capexSavedPhp = $this->estimateDeviceValuePhp($donorDevice);

            $rationale = sprintf(
                'Dynamic Bridge Swap: %s (%s) is currently overprovisioned with a %dGB %s %s. Deploying stockroom unit %s (%dGB %s) to %s fulfills their baseline workflow (Score: %d%%), immediately freeing up %s for %s without purchasing new hardware (CapEx Avoided: ₱%s).',
                $donor->name,
                $donorProfile->name,
                $donorDevice->ram_gb,
                $donorDevice->brand,
                $donorDevice->model,
                $bestBridgeDevice->asset_tag,
                $bestBridgeDevice->ram_gb,
                $bestBridgeDevice->model,
                $donor->name,
                round($bestBridgeScore * 100),
                $donorDevice->asset_tag,
                $requester ? $requester->name : 'the requesting role',
                number_format($capexSavedPhp, 2)
            );

            $candidates[] = [
                'donor_employee' => [
                    'id' => $donor->id,
                    'name' => $donor->name,
                    'department' => $donor->department,
                    'location' => $donor->location,
                    'role_profile' => [
                        'name' => $donorProfile->name,
                        'min_ram_gb' => $donorProfile->min_ram_gb,
                        'min_cpu_tier' => $donorProfile->min_cpu_tier,
                    ],
                ],
                'donor_device' => [
                    'id' => $donorDevice->id,
                    'asset_tag' => $donorDevice->asset_tag,
                    'brand' => $donorDevice->brand,
                    'model' => $donorDevice->model,
                    'device_type' => $donorDevice->device_type,
                    'ram_gb' => $donorDevice->ram_gb,
                    'cpu' => $donorDevice->cpu,
                    'cpu_tier' => $donorDevice->cpu_tier,
                    'gpu' => $donorDevice->gpu,
                    'condition' => $donorDevice->condition,
                    'image_clip_url' => $donorDevice->image_clip_url,
                    'image_url' => $donorDevice->image_url,
                ],
                'bridge_device' => [
                    'id' => $bestBridgeDevice->id,
                    'asset_tag' => $bestBridgeDevice->asset_tag,
                    'brand' => $bestBridgeDevice->brand,
                    'model' => $bestBridgeDevice->model,
                    'device_type' => $bestBridgeDevice->device_type,
                    'ram_gb' => $bestBridgeDevice->ram_gb,
                    'cpu' => $bestBridgeDevice->cpu,
                    'cpu_tier' => $bestBridgeDevice->cpu_tier,
                    'condition' => $bestBridgeDevice->condition,
                    'image_clip_url' => $bestBridgeDevice->image_clip_url,
                    'image_url' => $bestBridgeDevice->image_url,
                ],
                'requester_score_on_donor_device' => round($requesterEval['score'], 3),
                'donor_score_on_bridge_device' => round($bestBridgeScore, 3),
                'feasibility_score' => $compositeScore,
                'capex_saved_php' => $capexSavedPhp,
                'same_location' => $isSameLocation,
                'plan_steps' => [
                    "Step 1: Deploy Stockroom Unit {$bestBridgeDevice->asset_tag} ({$bestBridgeDevice->brand} {$bestBridgeDevice->model}) to {$donor->name}",
                    "Step 2: Retrieve and reassign {$donorDevice->asset_tag} ({$donorDevice->brand} {$donorDevice->model}) to Requester",
                ],
                'rationale' => $rationale,
            ];
        }

        // Sort candidates by feasibility score descending
        usort($candidates, fn ($a, $b) => $b['feasibility_score'] <=> $a['feasibility_score']);

        return $candidates;
    }

    /**
     * Atomically execute a 2-step bridge swap transaction with full lifecycle audit logs.
     */
    public function executeBridgeSwap(
        int $bridgeDeviceId,
        int $donorEmployeeId,
        int $requesterEmployeeId,
        int $donorDeviceId,
        ?int $userId = null
    ): array {
        return DB::transaction(function () use ($bridgeDeviceId, $donorEmployeeId, $requesterEmployeeId, $donorDeviceId, $userId) {
            $now = now();
            $donor = Employee::findOrFail($donorEmployeeId);
            $requester = Employee::findOrFail($requesterEmployeeId);
            $bridgeDevice = Device::findOrFail($bridgeDeviceId);
            $donorDevice = Device::findOrFail($donorDeviceId);

            // 1. Unassign donor from donor device
            Assignment::where('device_id', $donorDeviceId)
                ->where('employee_id', $donorEmployeeId)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => $now]);

            // 2. Unassign requester from prior device if any
            Assignment::where('employee_id', $requesterEmployeeId)
                ->whereNull('unassigned_at')
                ->update(['unassigned_at' => $now]);

            // 3. Assign bridge device to donor employee
            $bridgeDevice->update([
                'status' => 'assigned',
                'lifecycle_stage' => 'deployment',
            ]);
            $donorAssignment = Assignment::create([
                'device_id' => $bridgeDeviceId,
                'employee_id' => $donorEmployeeId,
                'assigned_at' => $now,
                'unassigned_at' => null,
                'match_score' => 0.85,
                'assignment_source' => 'ai_recommended',
            ]);

            // 4. Assign donor device to requester employee
            $donorDevice->update([
                'status' => 'assigned',
                'lifecycle_stage' => 'deployment',
            ]);
            $requesterAssignment = Assignment::create([
                'device_id' => $donorDeviceId,
                'employee_id' => $requesterEmployeeId,
                'assigned_at' => $now,
                'unassigned_at' => null,
                'match_score' => 0.95,
                'assignment_source' => 'ai_recommended',
            ]);

            // 5. Create LifecycleEvent logs for both devices
            LifecycleEvent::create([
                'device_id' => $bridgeDeviceId,
                'from_stage' => 'acquisition',
                'to_stage' => 'deployment',
                'changed_by_user_id' => $userId ?? auth()->id(),
                'notes' => "Deployed as Bridge Unit to {$donor->name} in 2-step cascade swap with {$donorDevice->asset_tag}.",
            ]);

            LifecycleEvent::create([
                'device_id' => $donorDeviceId,
                'from_stage' => 'deployment',
                'to_stage' => 'deployment',
                'changed_by_user_id' => $userId ?? auth()->id(),
                'notes' => "Cascade reallocated from {$donor->name} to {$requester->name} via Dynamic Inventory Bridge Swap (CapEx Avoided: ₱".number_format($this->estimateDeviceValuePhp($donorDevice), 2).').',
            ]);

            return [
                'success' => true,
                'donor_assignment' => $donorAssignment,
                'requester_assignment' => $requesterAssignment,
                'donor' => $donor,
                'requester' => $requester,
                'bridge_device' => $bridgeDevice,
                'donor_device' => $donorDevice,
            ];
        });
    }
}
