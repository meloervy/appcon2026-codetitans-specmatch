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

        $totalAcquisitionCost = $devices->sum(fn($d) => $d->purchase_cost ?? 1200.00);
        $currentBookValue = $devices->sum(fn($d) => $d->current_book_value);
        $totalDepreciation = max(0, $totalAcquisitionCost - $currentBookValue);

        $stageBreakdown = [
            'acquisition' => $devices->where('lifecycle_stage', 'acquisition')->count(),
            'deployment' => $devices->where('lifecycle_stage', 'deployment')->count(),
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
}
