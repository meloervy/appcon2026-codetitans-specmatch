<?php

namespace App\Http\Controllers;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Services\ItamTrackingService;
use App\Services\MatchingService;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(MatchingService $matchingService, ItamTrackingService $itamService): Response
    {
        $totalDevices = Device::where('status', '!=', 'retired')->count();
        $idleDevices = Device::where('status', 'available')->count();
        $assignedDevices = Device::where('status', 'assigned')->count();
        $inRepairDevices = Device::where('status', 'in_repair')->count();
        $retiredDevices = Device::where('status', 'retired')->count();

        $utilizationRate = $totalDevices > 0 ? round(($assignedDevices / $totalDevices) * 100, 1) : 0;

        $mismatches = $matchingService->detectMismatches();
        $mismatchCount = count($mismatches);

        // Procurement avoidance savings calculation:
        // Each appropriately assigned existing device avoids purchasing a new commercial unit (~₱65,000 avg)
        $properlyAssignedCount = max(0, $assignedDevices - count(array_filter($mismatches, fn ($m) => $m['classification'] === 'under-provisioned')));
        $procurementSavings = $properlyAssignedCount * 65000;

        $recentAssignments = Assignment::with(['device', 'employee.roleProfile'])
            ->latest('assigned_at')
            ->take(5)
            ->get();

        $availableFleet = Device::available()
            ->latest()
            ->take(6)
            ->get();

        $itamFinancials = $itamService->getFinancialSummary();
        $itamWarranties = $itamService->getWarrantyAlerts();
        $itamMaintenance = $itamService->getMaintenanceSummary();
        $itamRedundancy = $itamService->detectRedundantAssets();
        $itamFleetRisk = $itamService->getFleetRiskScore();

        return Inertia::render('Dashboard/Index', [
            'metrics' => [
                'total_devices' => $totalDevices,
                'idle_devices' => $idleDevices,
                'assigned_devices' => $assignedDevices,
                'in_repair_devices' => $inRepairDevices,
                'retired_devices' => $retiredDevices,
                'utilization_rate' => $utilizationRate,
                'mismatch_count' => $mismatchCount,
                'procurement_savings' => $procurementSavings,
                'total_employees' => Employee::count(),
                // ITAM metrics
                'total_acquisition_cost' => $itamFinancials['total_acquisition_cost'],
                'current_book_value' => $itamFinancials['current_book_value'],
                'total_depreciation' => $itamFinancials['total_depreciation'],
                'expiring_warranties_count' => $itamWarranties['expiring_soon_count'],
                'active_maintenance_count' => $itamMaintenance['active_maintenance_count'],
                'total_maintenance_spend' => $itamMaintenance['total_maintenance_spend'],
                'idle_high_spec_count' => $itamRedundancy['idle_high_spec_count'],
                'stage_breakdown' => $itamFinancials['stage_breakdown'],
                'fleet_risk' => $itamFleetRisk,
            ],
            'mismatches' => array_slice($mismatches, 0, 3),
            'recent_assignments' => $recentAssignments,
            'available_fleet' => $availableFleet,
            'itam' => [
                'financials' => $itamFinancials,
                'warranties' => $itamWarranties,
                'maintenance' => $itamMaintenance,
                'redundancy' => $itamRedundancy,
                'fleet_risk' => $itamFleetRisk,
            ],
        ]);
    }
}
