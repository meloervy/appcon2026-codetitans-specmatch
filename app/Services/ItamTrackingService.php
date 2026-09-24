<?php

namespace App\Services;

use App\Models\Device;
use App\Models\MaintenanceLog;
use Carbon\Carbon;

class ItamTrackingService
{
    /**
     * Calculate financial health, initial investment, and depreciated book value.
     */
    public function getFinancialSummary(): array
    {
        $devices = Device::all();

        $totalAcquisitionCost = $devices->sum(fn ($d) => $d->purchase_cost ?? 65000.00);
        $currentBookValue = $devices->sum(fn ($d) => $d->current_book_value);
        $totalDepreciation = max(0, $totalAcquisitionCost - $currentBookValue);

        $stageBreakdown = [
            'acquisition' => $devices->where('lifecycle_stage', 'acquisition')->count(),
            'deployment' => $devices->where('lifecycle_stage', 'deployment')->count(),
            'reclaimed' => $devices->where('lifecycle_stage', 'reclaimed')->count(),
            'maintenance' => $devices->where('lifecycle_stage', 'maintenance')->count(),
            'retirement' => $devices->where('lifecycle_stage', 'retirement')->count(),
        ];

        return [
            'total_acquisition_cost' => round($totalAcquisitionCost, 2),
            'current_book_value' => round($currentBookValue, 2),
            'total_depreciation' => round($totalDepreciation, 2),
            'stage_breakdown' => $stageBreakdown,
        ];
    }

    /**
     * Get warranty health and approaching expirations.
     */
    public function getWarrantyAlerts(): array
    {
        $devices = Device::whereNotNull('warranty_expiry')
            ->where('status', '!=', 'retired')
            ->get();

        $expiringSoon = [];
        $expired = [];

        $now = Carbon::now();

        foreach ($devices as $device) {
            $expiry = Carbon::parse($device->warranty_expiry);
            if ($expiry->isPast()) {
                $expired[] = $device;
            } elseif ($expiry->diffInDays($now) <= 60) {
                $expiringSoon[] = $device;
            }
        }

        return [
            'expiring_soon_count' => count($expiringSoon),
            'expired_count' => count($expired),
            'expiring_soon_devices' => array_slice($expiringSoon, 0, 5),
            'expired_devices' => array_slice($expired, 0, 5),
        ];
    }

    /**
     * Maintenance activity summary and spend.
     */
    public function getMaintenanceSummary(): array
    {
        $totalSpend = MaintenanceLog::where('status', 'completed')->sum('cost');
        $activeCount = MaintenanceLog::whereIn('status', ['scheduled', 'in_progress'])->count();

        $recentLogs = MaintenanceLog::with('device')
            ->latest('started_at')
            ->take(5)
            ->get();

        return [
            'total_maintenance_spend' => round($totalSpend, 2),
            'active_maintenance_count' => $activeCount,
            'recent_logs' => $recentLogs,
        ];
    }

    /**
     * Identify redundant or underutilized hardware assets to optimize efficiency.
     */
    public function detectRedundantAssets(): array
    {
        // High-spec idle machines (idle capital tie-up)
        $idleHighSpec = Device::available()
            ->whereIn('cpu_tier', ['high', 'workstation'])
            ->get();

        return [
            'idle_high_spec_count' => $idleHighSpec->count(),
            'idle_high_spec_devices' => $idleHighSpec,
        ];
    }

    /**
     * Calculate composite Fleet Operational Risk Score (0 - 100).
     * Combining warranty vulnerability, asset aging, and physical/maintenance health.
     *
     * @return array{
     *   risk_score: int,
     *   risk_tier: string,
     *   status_label: string,
     *   factors: array{
     *     warranty_risk_pct: float,
     *     aging_risk_pct: float,
     *     condition_risk_pct: float
     *   },
     *   counts: array{
     *     total_active: int,
     *     warranty_at_risk: int,
     *     aging_at_risk: int,
     *     condition_at_risk: int
     *   },
     *   key_alerts: array<string>
     * }
     */
    public function getFleetRiskScore(): array
    {
        $activeDevices = Device::where('status', '!=', 'retired')->get();
        $totalActive = $activeDevices->count();

        if ($totalActive === 0) {
            return [
                'risk_score' => 0,
                'risk_tier' => 'Low Risk',
                'status_label' => 'Healthy Fleet',
                'factors' => [
                    'warranty_risk_pct' => 0.0,
                    'aging_risk_pct' => 0.0,
                    'condition_risk_pct' => 0.0,
                ],
                'counts' => [
                    'total_active' => 0,
                    'warranty_at_risk' => 0,
                    'aging_at_risk' => 0,
                    'condition_at_risk' => 0,
                ],
                'key_alerts' => ['No active fleet hardware records.'],
            ];
        }

        $warrantyAtRisk = $activeDevices->filter(fn ($d) => $d->isWarrantyAtRisk())->count();
        $agingAtRisk = $activeDevices->filter(fn ($d) => $d->isAging())->count();
        $conditionAtRisk = $activeDevices->filter(fn ($d) => $d->hasConditionRisk())->count();

        $warrantyRiskPct = round(($warrantyAtRisk / $totalActive) * 100, 1);
        $agingRiskPct = round(($agingAtRisk / $totalActive) * 100, 1);
        $conditionRiskPct = round(($conditionAtRisk / $totalActive) * 100, 1);

        // Weighted operational risk index: Warranty (35%) + Aging (35%) + Physical Condition (30%)
        $compositeScore = (int) round(($warrantyRiskPct * 0.35) + ($agingRiskPct * 0.35) + ($conditionRiskPct * 0.30));
        $compositeScore = max(0, min(100, $compositeScore));

        $riskTier = match (true) {
            $compositeScore <= 25 => 'Low Risk',
            $compositeScore <= 55 => 'Moderate Risk',
            default => 'Elevated Risk',
        };

        $statusLabel = match (true) {
            $compositeScore <= 25 => 'Fleet Stable & Covered',
            $compositeScore <= 55 => 'Attention Needed',
            default => 'Urgent Lifecycle Refresh Required',
        };

        $alerts = [];
        if ($warrantyAtRisk > 0) {
            $alerts[] = "{$warrantyAtRisk} devices (".round($warrantyRiskPct).'%) have expired or expiring warranties';
        }
        if ($agingAtRisk > 0) {
            $alerts[] = "{$agingAtRisk} devices (".round($agingRiskPct).'%) are ≥ 3 years old in service';
        }
        if ($conditionAtRisk > 0) {
            $alerts[] = "{$conditionAtRisk} devices (".round($conditionRiskPct).'%) require maintenance or have degraded condition';
        }
        if (empty($alerts)) {
            $alerts[] = 'All active units are within warranty, modern, and in prime condition.';
        }

        return [
            'risk_score' => $compositeScore,
            'risk_tier' => $riskTier,
            'status_label' => $statusLabel,
            'factors' => [
                'warranty_risk_pct' => $warrantyRiskPct,
                'aging_risk_pct' => $agingRiskPct,
                'condition_risk_pct' => $conditionRiskPct,
            ],
            'counts' => [
                'total_active' => $totalActive,
                'warranty_at_risk' => $warrantyAtRisk,
                'aging_at_risk' => $agingAtRisk,
                'condition_at_risk' => $conditionAtRisk,
            ],
            'key_alerts' => $alerts,
        ];
    }
}
