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

    public const WEIGHT_PROFILES = [
        'balanced' => [
            'cpu' => 0.30,
            'ram' => 0.25,
            'storage' => 0.15,
            'gpu' => 0.20,
            'portability' => 0.10,
        ],
        'creative' => [
            'gpu' => 0.35,
            'cpu' => 0.25,
            'ram' => 0.20,
            'storage' => 0.10,
            'portability' => 0.10,
        ],
        'developer' => [
            'cpu' => 0.35,
            'ram' => 0.30,
            'storage' => 0.15,
            'gpu' => 0.10,
            'portability' => 0.10,
        ],
        'mobile_sales' => [
            'portability' => 0.30,
            'cpu' => 0.25,
            'ram' => 0.25,
            'storage' => 0.10,
            'gpu' => 0.10,
        ],
        'data_analyst' => [
            'cpu' => 0.30,
            'ram' => 0.35,
            'storage' => 0.15,
            'gpu' => 0.10,
            'portability' => 0.10,
        ],
    ];

    /**
     * Compute deterministic final weighted match score from sub-scores and weights (Contest Constraint #2).
     *
     * Supports both standard benchmark key formats:
     * - Contest spec: cpu_tier_match_score, ram_sufficiency_score, storage_sufficiency_score, gpu_match_score, portability_match_score
     * - Shorthand: cpu, ram, storage (or disk), gpu, portability (or port)
     */
    public function computeFinalScore(array $subScores, ?array $weights = null): float
    {
        $weights = $weights ?? self::WEIGHT_PROFILES['balanced'];

        $cpu = (float) ($subScores['cpu_tier_match_score'] ?? $subScores['cpu'] ?? 0.0);
        $ram = (float) ($subScores['ram_sufficiency_score'] ?? $subScores['ram'] ?? 0.0);
        $storage = (float) ($subScores['storage_sufficiency_score'] ?? $subScores['storage'] ?? $subScores['disk'] ?? 0.0);
        $gpu = (float) ($subScores['gpu_match_score'] ?? $subScores['gpu'] ?? 0.0);
        $portability = (float) ($subScores['portability_match_score'] ?? $subScores['portability'] ?? $subScores['port'] ?? 0.0);

        $wCpu = (float) ($weights['cpu'] ?? self::WEIGHT_PROFILES['balanced']['cpu']);
        $wRam = (float) ($weights['ram'] ?? self::WEIGHT_PROFILES['balanced']['ram']);
        $wStorage = (float) ($weights['storage'] ?? self::WEIGHT_PROFILES['balanced']['storage']);
        $wGpu = (float) ($weights['gpu'] ?? self::WEIGHT_PROFILES['balanced']['gpu']);
        $wPort = (float) ($weights['portability'] ?? self::WEIGHT_PROFILES['balanced']['portability']);

        $score = ($cpu * $wCpu)
               + ($ram * $wRam)
               + ($storage * $wStorage)
               + ($gpu * $wGpu)
               + ($portability * $wPort);

        return round(max(0.0, min(1.0, $score)), 3);
    }

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
        // Guard against empty or unspecified requirements (A1)
        if (empty($requirements) || (
            ! isset($requirements['min_cpu_tier']) &&
            ! isset($requirements['min_ram_gb']) &&
            ! isset($requirements['min_storage_gb']) &&
            ! isset($requirements['requires_gpu']) &&
            ! isset($requirements['portability_required'])
        )) {
            return [
                'results' => [],
                'top_candidate' => null,
                'alternative_comparisons' => [],
                'procurement_recommended' => false,
                'total_capex_savings_php' => 0.0,
                'threshold' => self::MATCH_THRESHOLD,
                'procurement_advisory' => [
                    'action' => 'awaiting_specifications',
                    'inventory_status' => 'Pending Specification',
                    'existing_inventory_prioritized' => true,
                    'recommendation_summary' => 'No hardware specification requirements were provided. Please specify employee role requirements before matching.',
                ],
            ];
        }

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

        // Sort descending by score; qualified devices first with deterministic multi-tier tiebreaker (A6)
        usort($ranked, function ($a, $b) {
            // 1. Qualified before disqualified
            if ($a['disqualified'] !== $b['disqualified']) {
                return $a['disqualified'] ? 1 : -1;
            }

            // 2. Score comparison (tolerance 0.001)
            if (abs($b['score'] - $a['score']) >= 0.001) {
                return $b['score'] <=> $a['score'];
            }

            $devA = $a['device'];
            $devB = $b['device'];

            // 3. Tiebreaker 1: Availability in stockroom
            $availA = $devA->status === 'available' ? 1 : 0;
            $availB = $devB->status === 'available' ? 1 : 0;
            if ($availA !== $availB) {
                return $availB <=> $availA;
            }

            // 4. Tiebreaker 2: Physical condition (excellent > good > fair)
            $condRanks = ['new' => 4, 'excellent' => 3, 'good' => 2, 'fair' => 1];
            $condA = $condRanks[strtolower($devA->condition ?? '')] ?? 0;
            $condB = $condRanks[strtolower($devB->condition ?? '')] ?? 0;
            if ($condA !== $condB) {
                return $condB <=> $condA;
            }

            // 5. Tiebreaker 3: Generation / Age (non-aging before aging)
            $agingA = $devA->isAging() ? 1 : 0;
            $agingB = $devB->isAging() ? 1 : 0;
            if ($agingA !== $agingB) {
                return $agingA <=> $agingB;
            }

            // 6. Tiebreaker 4: Warranty status (active > expiring_soon > expired)
            $warrRanks = ['active' => 3, 'expiring_soon' => 2, 'expired' => 1, 'none' => 0];
            $warrA = $warrRanks[$devA->warranty_status] ?? 0;
            $warrB = $warrRanks[$devB->warranty_status] ?? 0;
            if ($warrA !== $warrB) {
                return $warrB <=> $warrA;
            }

            // 7. Tiebreaker 5: Capital preservation - lower replacement cost preserves flagship units
            $costA = $devA->purchase_cost ?? $this->estimateDeviceValuePhp($devA);
            $costB = $devB->purchase_cost ?? $this->estimateDeviceValuePhp($devB);
            if ($costA != $costB) {
                return $costA <=> $costB;
            }

            // 8. Deterministic fallback: asset tag ascending
            return strcmp($devA->asset_tag, $devB->asset_tag);
        });

        $topCandidate = null;
        $alternativeComparisons = [];

        foreach ($ranked as $candidate) {
            if (! $candidate['disqualified'] && $candidate['score'] >= self::MATCH_THRESHOLD) {
                $topCandidate = $candidate;
                break;
            }
        }

        if ($topCandidate) {
            $topDev = $topCandidate['device'];
            $rankCounter = 1;

            for ($i = 0; $i < count($ranked); $i++) {
                if ($ranked[$i]['device']->id === $topDev->id) {
                    continue;
                }

                $cand = &$ranked[$i];
                $candDev = $cand['device'];
                $rankCounter++;

                $reasons = [];

                if ($cand['disqualified']) {
                    $reasons[] = $cand['disqualification_reason'] ?? 'Disqualified by hard eligibility filter.';
                } else {
                    // RAM comparison
                    if ($candDev->ram_gb < $topDev->ram_gb) {
                        $diff = $topDev->ram_gb - $candDev->ram_gb;
                        $reasons[] = "{$diff}GB less RAM ({$candDev->ram_gb}GB vs Top Pick's {$topDev->ram_gb}GB)";
                    }
                    // CPU tier comparison
                    $cpuDiff = (self::CPU_TIERS[$topDev->cpu_tier] ?? 1) - (self::CPU_TIERS[$candDev->cpu_tier] ?? 1);
                    if ($cpuDiff > 0) {
                        $reasons[] = "Lower CPU tier ({$candDev->cpu_tier} vs Top Pick's {$topDev->cpu_tier})";
                    }
                    // GPU comparison
                    $gpuDiff = (self::GPU_TIERS[$topDev->gpu_tier] ?? 0) - (self::GPU_TIERS[$candDev->gpu_tier] ?? 0);
                    if ($gpuDiff > 0) {
                        $reasons[] = "Inferior GPU tier ({$candDev->gpu_tier} vs {$topDev->gpu_tier})";
                    }
                    // Form factor / Portability
                    if (! empty($requirements['portability_required']) && $candDev->device_type !== 'laptop') {
                        $reasons[] = 'Desktop form factor lacks required mobility';
                    }
                    // Condition & Age
                    if ($candDev->isAging() && ! $topDev->isAging()) {
                        $reasons[] = 'Older hardware generation (≥3 years in service)';
                    }
                    if (in_array(strtolower($candDev->condition ?? ''), ['fair', 'poor']) && in_array(strtolower($topDev->condition ?? ''), ['excellent', 'good'])) {
                        $reasons[] = "Suboptimal physical condition ({$candDev->condition})";
                    }
                    if (empty($reasons)) {
                        $scoreDelta = (int) round(($topCandidate['score'] - $cand['score']) * 100);
                        $reasons[] = "Lower composite alignment score (-{$scoreDelta}%)";
                    }
                }

                $cand['why_not_reasons'] = $reasons;

                if (count($alternativeComparisons) < 3) {
                    $alternativeComparisons[] = [
                        'rank' => $rankCounter,
                        'device_id' => $candDev->id,
                        'asset_tag' => $candDev->asset_tag,
                        'brand' => $candDev->brand,
                        'model' => $candDev->model,
                        'image_clip_url' => $candDev->image_clip_url,
                        'score' => $cand['score'],
                        'score_delta_pct' => (int) round(($topCandidate['score'] - $cand['score']) * 100),
                        'fit_grade' => $cand['fit_grade'],
                        'why_not_reasons' => $reasons,
                        'verdict' => $cand['disqualified']
                            ? 'Ineligible for this role'
                            : 'Viable secondary option with tighter operational margins',
                    ];
                }
            }
            unset($cand);
        }

        $procurementAdvisory = [
            'action' => $hasEligibleAboveThreshold ? 'deploy_internal_asset' : 'evaluate_bridge_swap_or_procurement',
            'inventory_status' => $hasEligibleAboveThreshold ? 'Inventory Sufficient' : 'Inventory Depleted for Specification',
            'existing_inventory_prioritized' => true,
            'recommendation_summary' => $hasEligibleAboveThreshold
                ? "Immediate internal deployment recommended: Stockroom unit {$topCandidate['device']->asset_tag} satisfies operational criteria and saves ₱".number_format($totalCapexSavings, 2).' in avoided CapEx.'
                : 'No existing idle device directly satisfies the operational threshold (0.65). ITAM policy requires reviewing internal Bridge Swaps before requesting external CapEx purchase authorization.',
        ];

        return [
            'results' => $ranked,
            'top_candidate' => $topCandidate,
            'alternative_comparisons' => $alternativeComparisons,
            'procurement_recommended' => ! $hasEligibleAboveThreshold,
            'total_capex_savings_php' => $totalCapexSavings,
            'threshold' => self::MATCH_THRESHOLD,
            'procurement_advisory' => $procurementAdvisory,
        ];
    }

    /**
     * Evaluate a single device against a set of requirements.
     */
    public function evaluateDevice(Device $device, array $requirements, bool $availableOnly = false): array
    {
        // Guard against empty or unspecified requirements (A1)
        if (empty($requirements) || (
            ! isset($requirements['min_cpu_tier']) &&
            ! isset($requirements['min_ram_gb']) &&
            ! isset($requirements['min_storage_gb']) &&
            ! isset($requirements['requires_gpu']) &&
            ! isset($requirements['portability_required'])
        )) {
            return [
                'device' => $device,
                'score' => 0.0,
                'base_score' => 0.0,
                'subscores' => ['cpu' => 0.0, 'ram' => 0.0, 'storage' => 0.0, 'gpu' => 0.0, 'portability' => 0.0],
                'subscore_audit' => [],
                'component_meters' => ['cpu' => 0, 'ram' => 0, 'storage' => 0, 'gpu' => 0, 'portability' => 0, 'condition' => 0],
                'capex_saved_php' => 0.0,
                'procurement_avoidance_audit' => [],
                'confidence_score' => 0,
                'confidence_level' => 'Unconstrained Request',
                'confidence_explanation' => 'No hardware specification requirements were provided in match request.',
                'fit_grade' => 'Unspecified',
                'overprovisioning_risk' => false,
                'rationale' => 'No hardware requirements provided to evaluate this device against.',
                'disqualified' => true,
                'disqualification_reason' => 'Empty or unspecified hardware requirements.',
                'passes_threshold' => false,
                'is_available_for_deployment' => ($device->status === 'available'),
                'deployment_readiness' => 'Pending Specification',
            ];
        }

        $requiresGpu = ! empty($requirements['requires_gpu']);
        $reqGpuTier = $requirements['min_gpu_tier'] ?? 'none';
        $portabilityRequired = ! empty($requirements['portability_required']);

        // Hard eligibility filter (doc.md §8.3 & A3)
        $disqualified = false;
        $disqualificationReason = null;

        if ($availableOnly && $device->status !== 'available') {
            $disqualified = true;
            $disqualificationReason = "Device status is '{$device->status}' (requires available).";
        } elseif ($requiresGpu && $device->gpu_tier === 'none') {
            $disqualified = true;
            $disqualificationReason = 'Workload requires dedicated or integrated GPU, but device has no GPU.';
        } elseif (in_array(strtolower($device->condition ?? ''), ['poor', 'needs_repair', 'retired', 'degraded'], true)) {
            $disqualified = true;
            $disqualificationReason = "Device physical condition is '{$device->condition}' (requires fair, good, or excellent for deployment).";
        }

        // Dynamic workload-tailored weights (A4)
        $weights = $this->resolveWeights($requirements);

        // Calculate sub-scores (0.0 to 1.0) with generation awareness (A2)
        $cpuScore = $this->scoreCpuTier($device->cpu_tier, $requirements['min_cpu_tier'] ?? 'entry', $device);
        $ramScore = $this->scoreRam($device->ram_gb, (int) ($requirements['min_ram_gb'] ?? 8));
        $storageScore = $this->scoreStorage($device->storage_gb, (int) ($requirements['min_storage_gb'] ?? 256));
        $gpuScore = $this->scoreGpu($device->gpu_tier, $requiresGpu, $reqGpuTier);
        $portabilityScore = $this->scorePortability($device->device_type, $portabilityRequired);

        // Sub-scores (0.0 to 1.0) with generation awareness (A2)
        $subscores = [
            'cpu' => round($cpuScore, 3),
            'ram' => round($ramScore, 3),
            'storage' => round($storageScore, 3),
            'gpu' => round($gpuScore, 3),
            'portability' => round($portabilityScore, 3),
        ];

        // Deterministic weighted total using resolved weights (Contest Constraint #2)
        $finalScore = $this->computeFinalScore($subscores, $weights);
        $baseScore = $finalScore;

        // ITAM Condition & Lifecycle Modifiers (Recorded for Hardware Health Diagnostics)
        // 1. Condition adjustment (+0.02 for excellent/good, -0.04 for fair, -0.15 for poor)
        $conditionMod = match (strtolower($device->condition ?? 'good')) {
            'new', 'excellent' => 0.02,
            'good' => 0.01,
            'fair' => -0.04,
            'poor', 'degraded' => -0.15,
            default => 0.0,
        };

        // 2. Lifecycle adjustment (+0.02 for operational/deployment/reclaimed, -0.15 for maintenance)
        $lifecycleMod = match (strtolower($device->lifecycle_stage ?? 'deployment')) {
            'operational', 'deployment', 'reclaimed' => 0.02,
            'acquisition' => 0.01,
            'maintenance' => -0.15,
            'retired', 'disposed', 'retirement' => -0.30,
            default => 0.0,
        };

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
        $deviceMarketValue = $this->estimateDeviceValuePhp($device);

        $procurementAvoidanceAudit = [
            'avoided_capex_php' => $capexSavedPhp,
            'market_replacement_benchmark_php' => $deviceMarketValue,
            'benchmark_source' => $device->purchase_cost ? 'Procurement Invoice Record' : "Commercial Hardware Benchmark ({$device->device_type} • ".ucfirst($device->cpu_tier).' tier)',
            'redeployment_cost_php' => 0.00,
            'formula' => 'Net CapEx Avoided = Benchmark Replacement (₱'.number_format($deviceMarketValue, 2).') - Redeployment Cost (₱0.00)',
            'audit_note' => "Reallocating existing asset {$device->asset_tag} directly displaces a new ₱".number_format($deviceMarketValue, 0).' commercial procurement expenditure from the IT capital budget.',
        ];

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

        // Detailed Sub-score Audit for transparency and mathematical explainability
        $subscoreAudit = [
            'cpu' => [
                'score' => round($cpuScore, 3),
                'weight' => $weights['cpu'],
                'weighted_score' => round($cpuScore * $weights['cpu'], 3),
                'provided' => $device->cpu.' ('.ucfirst($device->cpu_tier).' Tier)',
                'required' => ucfirst($requirements['min_cpu_tier'] ?? 'entry').' Tier',
                'status' => ((self::CPU_TIERS[$device->cpu_tier] ?? 1) - (self::CPU_TIERS[$requirements['min_cpu_tier'] ?? 'entry'] ?? 1)) === 0
                    ? 'Met'
                    : (((self::CPU_TIERS[$device->cpu_tier] ?? 1) > (self::CPU_TIERS[$requirements['min_cpu_tier'] ?? 'entry'] ?? 1)) ? 'Exceeded' : 'Deficit'),
                'delta' => (self::CPU_TIERS[$device->cpu_tier] ?? 1) - (self::CPU_TIERS[$requirements['min_cpu_tier'] ?? 'entry'] ?? 1),
            ],
            'ram' => [
                'score' => round($ramScore, 3),
                'weight' => $weights['ram'],
                'weighted_score' => round($ramScore * $weights['ram'], 3),
                'provided' => "{$device->ram_gb} GB",
                'required' => ($requirements['min_ram_gb'] ?? 8).' GB',
                'status' => $ramScore >= 1.0 ? 'Met' : ($ramScore >= 0.85 ? 'Headroom' : 'Deficit'),
                'delta_gb' => $device->ram_gb - ($requirements['min_ram_gb'] ?? 8),
            ],
            'storage' => [
                'score' => round($storageScore, 3),
                'weight' => $weights['storage'],
                'weighted_score' => round($storageScore * $weights['storage'], 3),
                'provided' => "{$device->storage_gb} GB {$device->storage_type}",
                'required' => ($requirements['min_storage_gb'] ?? 256).' GB',
                'status' => $storageScore >= 1.0 ? 'Met' : ($storageScore >= 0.85 ? 'Headroom' : 'Deficit'),
                'delta_gb' => $device->storage_gb - ($requirements['min_storage_gb'] ?? 256),
            ],
            'gpu' => [
                'score' => round($gpuScore, 3),
                'weight' => $weights['gpu'],
                'weighted_score' => round($gpuScore * $weights['gpu'], 3),
                'provided' => $device->gpu ? "{$device->gpu} ({$device->gpu_tier})" : ($device->gpu_tier !== 'none' ? ucfirst($device->gpu_tier) : 'Integrated/None'),
                'required' => $requiresGpu ? ucfirst($reqGpuTier) : 'None / Optional',
                'status' => $gpuScore >= 1.0 ? 'Met' : ($gpuScore >= 0.7 ? 'Exceeded' : ($gpuScore == 0.3 ? 'Overkill' : 'Deficit')),
            ],
            'portability' => [
                'score' => round($portabilityScore, 3),
                'weight' => $weights['portability'],
                'weighted_score' => round($portabilityScore * $weights['portability'], 3),
                'provided' => ucfirst($device->device_type),
                'required' => $portabilityRequired ? 'Laptop (Mobile)' : 'Any / Desktop Preferred',
                'status' => $portabilityScore >= 1.0 ? 'Met' : 'Suboptimal',
            ],
            'weight_profile' => $weights['profile_name'] ?? 'balanced',
            'weights' => [
                'cpu' => $weights['cpu'],
                'ram' => $weights['ram'],
                'storage' => $weights['storage'],
                'gpu' => $weights['gpu'],
                'portability' => $weights['portability'],
            ],
            'modifiers' => [
                'condition' => [
                    'adjustment' => $conditionMod,
                    'label' => ucfirst($device->condition ?? 'Good'),
                ],
                'lifecycle' => [
                    'adjustment' => $lifecycleMod,
                    'label' => ucfirst($device->lifecycle_stage ?? 'Deployment'),
                ],
            ],
        ];

        // Confidence Rating (0 - 100): Separates raw spec fit from sustainability/risk factors
        $exactnessRatio = ($cpuScore >= 0.8 && $ramScore >= 0.85 && $storageScore >= 0.85) ? 1.0 : 0.6;
        if ($disqualified) {
            $exactnessRatio = 0.0;
        }

        $conditionWeight = match (strtolower($device->condition ?? 'good')) {
            'new', 'excellent' => 1.0,
            'good' => 0.85,
            'fair' => 0.50,
            default => 0.20,
        };

        $ageWeight = $device->isAging() ? 0.45 : 1.0;

        $warrantyWeight = match ($device->warranty_status) {
            'active' => 1.0,
            'expiring_soon' => 0.65,
            default => 0.35,
        };

        $confidenceScore = (int) round(
            (($exactnessRatio * 0.35) + ($conditionWeight * 0.25) + ($ageWeight * 0.20) + ($warrantyWeight * 0.20)) * 100
        );
        $confidenceScore = max(0, min(100, $confidenceScore));

        $confidenceLevel = match (true) {
            $confidenceScore >= 80 => 'High Confidence',
            $confidenceScore >= 60 => 'Moderate Confidence',
            default => 'Cautious Recommendation',
        };

        $confidenceExplanation = sprintf(
            '%s (%d/100): %s condition, %s, warranty %s.',
            $confidenceLevel,
            $confidenceScore,
            ucfirst($device->condition ?? 'good'),
            $device->isAging() ? 'aging hardware (≥3 yrs)' : 'modern platform',
            $device->warranty_status === 'active' ? 'active' : ($device->warranty_status === 'expiring_soon' ? 'expiring soon' : 'expired/none')
        );

        $rationale = $this->generateRationale($device, $requirements, $subscores, $disqualified, $disqualificationReason);

        return [
            'device' => $device,
            'score' => $finalScore,
            'base_score' => round($baseScore, 3),
            'weights' => [
                'cpu' => $weights['cpu'],
                'ram' => $weights['ram'],
                'storage' => $weights['storage'],
                'gpu' => $weights['gpu'],
                'portability' => $weights['portability'],
            ],
            'subscores' => $subscores,
            'subscore_audit' => $subscoreAudit,
            'component_meters' => $componentMeters,
            'capex_saved_php' => $capexSavedPhp,
            'procurement_avoidance_audit' => $procurementAvoidanceAudit,
            'confidence_score' => $confidenceScore,
            'confidence_level' => $confidenceLevel,
            'confidence_explanation' => $confidenceExplanation,
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

    /**
     * Resolve dynamic workload-tailored scoring weights (A4).
     */
    public function resolveWeights(array $requirements): array
    {
        // 1. Explicit custom weights array
        if (! empty($requirements['weights']) && is_array($requirements['weights'])) {
            $w = $requirements['weights'];
            $cpu = (float) ($w['cpu'] ?? 0.30);
            $ram = (float) ($w['ram'] ?? 0.25);
            $storage = (float) ($w['storage'] ?? 0.15);
            $gpu = (float) ($w['gpu'] ?? 0.20);
            $portability = (float) ($w['portability'] ?? 0.10);
            $total = $cpu + $ram + $storage + $gpu + $portability;
            if ($total > 0) {
                return [
                    'cpu' => round($cpu / $total, 3),
                    'ram' => round($ram / $total, 3),
                    'storage' => round($storage / $total, 3),
                    'gpu' => round($gpu / $total, 3),
                    'portability' => round($portability / $total, 3),
                    'profile_name' => 'custom',
                ];
            }
        }

        // 2. Explicit weight profile or workload type
        $profileName = $requirements['weight_profile'] ?? $requirements['workload_type'] ?? null;
        if ($profileName && isset(self::WEIGHT_PROFILES[$profileName])) {
            $profile = self::WEIGHT_PROFILES[$profileName];
            $profile['profile_name'] = $profileName;

            return $profile;
        }

        // 3. Balanced default profile
        $default = self::WEIGHT_PROFILES['balanced'];
        $default['profile_name'] = 'balanced';

        return $default;
    }

    private function scoreCpuTier(string $deviceTier, string $requiredTier, ?Device $device = null): float
    {
        $devVal = self::CPU_TIERS[$deviceTier] ?? 1;
        $reqVal = self::CPU_TIERS[$requiredTier] ?? 1;
        $diff = $devVal - $reqVal;

        if ($diff === 0) {
            $rawScore = 1.0;
        } elseif ($diff === 1) {
            $rawScore = 0.8; // One tier above (discourages over-provisioning)
        } elseif ($diff === 2) {
            $rawScore = 0.4;
        } elseif ($diff > 2) {
            $rawScore = 0.2;
        } else {
            return 0.0; // Below requirement
        }

        // Generation / Aging awareness (A2)
        // If device processor is aging (>= 3 years in service or older architecture),
        // apply architectural generation discount so an old i7 from 2012 cannot score identical to a modern i7.
        if ($device && $device->isAging()) {
            $currentYear = (int) date('Y');
            $year = $device->year_acquired ?: ($currentYear - 3);
            $ageInYears = max(3, $currentYear - $year);
            $agePenalty = min(0.20, max(0.05, ($ageInYears - 2) * 0.04));
            $rawScore = max(0.1, round($rawScore - $agePenalty, 3));
        }

        return $rawScore;
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

    /**
     * Atomically reclaim an assigned device back into the inventory pool during employee offboarding or role change,
     * record full lifecycle audit event, and identify immediate re-circulation opportunities.
     *
     * @param  array{
     *   reason: string,
     *   condition: string,
     *   wipe_confirmed: bool,
     *   notes: ?string
     * }  $details
     */
    public function reclaimDevice(int $employeeId, array $details, ?int $userId = null): array
    {
        return DB::transaction(function () use ($employeeId, $details, $userId) {
            $now = now();
            $employee = Employee::with(['activeAssignment.device', 'roleProfile'])->findOrFail($employeeId);
            $assignment = $employee->activeAssignment;

            if (! $assignment || ! $assignment->device) {
                throw new \InvalidArgumentException("Employee {$employee->name} does not have an active device assignment to reclaim.");
            }

            $device = $assignment->device;
            $fromStage = $device->lifecycle_stage;

            // 1. Mark assignment unassigned
            $assignment->update(['unassigned_at' => $now]);

            // 2. Set new condition and lifecycle stage
            $newCondition = $details['condition'] ?? $device->condition;
            $targetStage = ($newCondition === 'needs_repair') ? 'maintenance' : 'reclaimed';
            $targetStatus = ($newCondition === 'needs_repair') ? 'in_repair' : 'available';

            $device->update([
                'condition' => $newCondition,
                'status' => $targetStatus,
                'lifecycle_stage' => $targetStage,
            ]);

            // 3. Log LifecycleEvent
            $wipeStatus = (! empty($details['wipe_confirmed'])) ? 'Data Wipe Verified & Sanitized' : 'Wipe Pending';
            $reasonLabel = ucfirst(str_replace('_', ' ', $details['reason'] ?? 'Offboarding'));
            $eventNotes = sprintf(
                'Asset reclaimed from %s via %s. Condition: %s. %s. %s',
                $employee->name,
                $reasonLabel,
                ucfirst($newCondition),
                $wipeStatus,
                $details['notes'] ?? ''
            );

            LifecycleEvent::create([
                'device_id' => $device->id,
                'from_stage' => $fromStage,
                'to_stage' => $targetStage,
                'changed_by_user_id' => $userId ?? auth()->id(),
                'notes' => trim($eventNotes),
            ]);

            // 4. Find immediate recirculation matches
            $recirculationMatches = $this->findRecirculationMatches($device, $employeeId);

            return [
                'success' => true,
                'message' => "Device {$device->asset_tag} ({$device->brand} {$device->model}) reclaimed from {$employee->name} and returned to pool.",
                'device' => $device->fresh(),
                'employee' => $employee,
                'circulation_matches' => $recirculationMatches,
            ];
        });
    }

    /**
     * Find employees who can immediately receive a newly reclaimed device.
     * Evaluates unassigned employees or employees with under-provisioned active assignments.
     */
    public function findRecirculationMatches(Device $device, ?int $excludeEmployeeId = null): array
    {
        // 1. Get employees with role profiles
        $query = Employee::with(['roleProfile', 'activeAssignment.device'])
            ->whereNotNull('role_profile_id');

        if ($excludeEmployeeId) {
            $query->where('id', '!=', $excludeEmployeeId);
        }

        $candidates = $query->get();

        $matches = [];

        foreach ($candidates as $candidate) {
            $profile = $candidate->roleProfile;
            if (! $profile) {
                continue;
            }

            $requirements = [
                'min_cpu_tier' => $profile->min_cpu_tier,
                'min_ram_gb' => $profile->min_ram_gb,
                'min_storage_gb' => $profile->min_storage_gb,
                'requires_gpu' => (bool) $profile->requires_gpu,
                'min_gpu_tier' => $profile->min_gpu_tier ?? 'none',
                'portability_required' => (bool) $profile->portability_required,
            ];

            // Evaluate this reclaimed device for candidate employee
            $eval = $this->evaluateDevice($device, $requirements, false);

            if ($eval['disqualified'] || $eval['score'] < self::MATCH_THRESHOLD) {
                continue;
            }

            // Determine recirculation priority
            $priority = 'standard';
            $priorityReason = 'Eligible for assignment';

            $currentAssignment = $candidate->activeAssignment;
            if (! $currentAssignment) {
                $priority = 'high';
                $priorityReason = 'Awaiting hardware assignment';
            } elseif ($currentAssignment->device) {
                $currentEval = $this->evaluateDevice($currentAssignment->device, $requirements, false);
                if ($eval['score'] > $currentEval['score'] + 0.15) {
                    $priority = 'urgent_upgrade';
                    $priorityReason = sprintf(
                        'Upgrades under-provisioned specs (+%d%% match gain)',
                        round(($eval['score'] - $currentEval['score']) * 100)
                    );
                }
            }

            $matches[] = [
                'employee_id' => $candidate->id,
                'name' => $candidate->name,
                'department' => $candidate->department,
                'role_name' => $profile->name,
                'match_score' => $eval['score'],
                'fit_grade' => $eval['fit_grade'],
                'priority' => $priority,
                'priority_reason' => $priorityReason,
                'current_device_tag' => $currentAssignment?->device?->asset_tag ?? 'None (Unassigned)',
            ];
        }

        // Sort descending by priority then match score
        usort($matches, function ($a, $b) {
            $pOrder = ['urgent_upgrade' => 3, 'high' => 2, 'standard' => 1];
            $pA = $pOrder[$a['priority']] ?? 0;
            $pB = $pOrder[$b['priority']] ?? 0;

            if ($pA !== $pB) {
                return $pB <=> $pA;
            }

            return $b['match_score'] <=> $a['match_score'];
        });

        return array_slice($matches, 0, 5);
    }

    /**
     * Simulate hypothetical headcount and role requirements against current stockroom inventory.
     *
     * @param  array{
     *   min_cpu_tier: string,
     *   min_ram_gb: int,
     *   min_storage_gb: int,
     *   requires_gpu: bool,
     *   min_gpu_tier?: string,
     *   portability_required: bool
     * }  $requirements
     */
    public function simulateHeadcount(array $requirements, int $quantity): array
    {
        $quantity = max(1, $quantity);
        $availableDevices = Device::available()->get();

        $qualifiedDevices = [];

        foreach ($availableDevices as $device) {
            $eval = $this->evaluateDevice($device, $requirements, true);
            if (! $eval['disqualified'] && $eval['score'] >= self::MATCH_THRESHOLD) {
                $qualifiedDevices[] = [
                    'device' => $device,
                    'evaluation' => $eval,
                ];
            }
        }

        // Sort by evaluation score descending
        usort($qualifiedDevices, fn ($a, $b) => $b['evaluation']['score'] <=> $a['evaluation']['score']);

        $coveredUnits = array_slice($qualifiedDevices, 0, $quantity);
        $coveredCount = count($coveredUnits);
        $deficitCount = max(0, $quantity - $coveredCount);

        // CapEx Calculations
        $capexAvoidedPhp = array_sum(array_map(
            fn ($u) => $u['evaluation']['capex_saved_php'],
            $coveredUnits
        ));

        // Baseline benchmark for required hardware
        $reqCpu = $requirements['min_cpu_tier'] ?? 'entry';
        $isLaptop = ! empty($requirements['portability_required']);
        $unitProcurementBenchmark = match ($reqCpu) {
            'workstation' => 185000.00,
            'high' => $isLaptop ? 120000.00 : 95000.00,
            'mid' => $isLaptop ? 65000.00 : 45000.00,
            default => $isLaptop ? 32000.00 : 25000.00,
        };

        $capexRequiredPhp = $deficitCount * $unitProcurementBenchmark;
        $coveragePercentage = round(($coveredCount / $quantity) * 100, 1);

        $deployableList = array_map(function ($u) {
            $dev = $u['device'];
            $eval = $u['evaluation'];

            return [
                'id' => $dev->id,
                'asset_tag' => $dev->asset_tag,
                'brand' => $dev->brand,
                'model' => $dev->model,
                'device_type' => $dev->device_type,
                'cpu' => $dev->cpu,
                'cpu_tier' => $dev->cpu_tier,
                'ram_gb' => $dev->ram_gb,
                'storage_gb' => $dev->storage_gb,
                'storage_type' => $dev->storage_type,
                'gpu' => $dev->gpu,
                'location' => $dev->location,
                'condition' => $dev->condition,
                'image_clip_url' => $dev->image_clip_url,
                'match_score' => $eval['score'],
                'fit_grade' => $eval['fit_grade'],
                'confidence_level' => $eval['confidence_level'],
                'capex_saved_php' => $eval['capex_saved_php'],
            ];
        }, $coveredUnits);

        $summary = sprintf(
            'Stockroom inventory covers %d of %d required seats (%g%% coverage), avoiding ₱%s in new procurement. %s',
            $coveredCount,
            $quantity,
            $coveragePercentage,
            number_format($capexAvoidedPhp, 2),
            $deficitCount > 0
                ? 'CapEx of ~₱'.number_format($capexRequiredPhp, 2)." required to purchase {$deficitCount} units."
                : 'Zero CapEx procurement required—all seats satisfied from existing idle stock.'
        );

        return [
            'quantity_requested' => $quantity,
            'covered_count' => $coveredCount,
            'deficit_count' => $deficitCount,
            'coverage_percentage' => $coveragePercentage,
            'capex_avoided_php' => $capexAvoidedPhp,
            'capex_required_php' => $capexRequiredPhp,
            'unit_procurement_benchmark_php' => $unitProcurementBenchmark,
            'procurement_needed' => $deficitCount > 0,
            'requisition_spec' => [
                'cpu_tier' => ucfirst($reqCpu),
                'ram_gb' => $requirements['min_ram_gb'] ?? 8,
                'storage_gb' => $requirements['min_storage_gb'] ?? 256,
                'gpu_required' => ! empty($requirements['requires_gpu']),
                'gpu_tier' => $requirements['min_gpu_tier'] ?? 'none',
                'device_type' => $isLaptop ? 'Laptop' : 'Desktop',
            ],
            'deployable_units' => $deployableList,
            'summary' => $summary,
        ];
    }
}
