<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\LifecycleEvent;
use App\Models\MaintenanceLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MaintenanceController extends Controller
{
    /**
     * Display central maintenance & servicing log.
     */
    public function index(Request $request): Response
    {
        $query = MaintenanceLog::with('device');

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('title', 'like', "%{$s}%")
                    ->orWhere('description', 'like', "%{$s}%")
                    ->orWhere('performed_by', 'like', "%{$s}%")
                    ->orWhereHas('device', function ($dq) use ($s) {
                        $dq->where('asset_tag', 'like', "%{$s}%")
                            ->orWhere('model', 'like', "%{$s}%")
                            ->orWhere('brand', 'like', "%{$s}%");
                    });
            });
        }

        $allowedSorts = [
            'device' => 'device_id',
            'asset_tag' => 'devices.asset_tag',
            'activity' => 'title',
            'title' => 'title',
            'type' => 'type',
            'scope' => 'description',
            'description' => 'description',
            'technician' => 'performed_by',
            'performed_by' => 'performed_by',
            'cost' => 'cost',
            'timeline' => 'started_at',
            'started_at' => 'started_at',
            'completed_at' => 'completed_at',
            'status' => 'status',
            'created_at' => 'created_at',
        ];

        $sort = $request->input('sort', 'started_at');
        $direction = strtolower($request->input('direction', 'desc')) === 'asc' ? 'asc' : 'desc';

        if ($sort === 'device' || $sort === 'asset_tag') {
            $query->join('devices', 'maintenance_logs.device_id', '=', 'devices.id')
                ->orderBy('devices.asset_tag', $direction)
                ->select('maintenance_logs.*');
        } else {
            $sortColumn = $allowedSorts[$sort] ?? 'started_at';
            $query->orderBy($sortColumn, $direction);
        }

        $logs = $query->paginate(15)->withQueryString();

        $stats = [
            'total_spend' => MaintenanceLog::where('status', 'completed')->sum('cost'),
            'active_count' => MaintenanceLog::whereIn('status', ['scheduled', 'in_progress'])->count(),
            'active_repairs' => MaintenanceLog::whereIn('status', ['scheduled', 'in_progress'])->count(),
            'completed_count' => MaintenanceLog::where('status', 'completed')->count(),
        ];

        return Inertia::render('Maintenance/Index', [
            'logs' => $logs,
            'stats' => $stats,
            'filters' => [
                'type' => $request->input('type', ''),
                'status' => $request->input('status', ''),
                'search' => $request->input('search', ''),
                'sort' => $sort,
                'direction' => $direction,
            ],
        ]);
    }

    /**
     * Store a maintenance record for a specific device.
     */
    public function store(Request $request, int $deviceId): RedirectResponse
    {
        $device = Device::findOrFail($deviceId);

        $validated = $request->validate([
            'type' => ['required', 'in:repair,upgrade,preventive,inspection,replacement'],
            'title' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'cost' => ['required', 'numeric', 'min:0'],
            'performed_by' => ['nullable', 'string', 'max:150'],
            'started_at' => ['required', 'date'],
            'completed_at' => ['nullable', 'date', 'after_or_equal:started_at'],
            'performance_assessment' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,in_progress,completed,cancelled'],
            'send_to_maintenance_stage' => ['nullable', 'boolean'],
        ]);

        $log = $device->maintenanceLogs()->create($validated);

        // If maintenance is ongoing or user opted to transition stage
        if (!empty($validated['send_to_maintenance_stage']) || in_array($validated['status'], ['scheduled', 'in_progress'])) {
            if ($device->lifecycle_stage !== 'maintenance') {
                $oldStage = $device->lifecycle_stage;
                $device->update([
                    'lifecycle_stage' => 'maintenance',
                    'status' => 'in_repair',
                ]);

                LifecycleEvent::create([
                    'device_id' => $device->id,
                    'from_stage' => $oldStage,
                    'to_stage' => 'maintenance',
                    'changed_by_user_id' => auth()->id(),
                    'notes' => "Initiated {$validated['type']}: {$validated['title']}",
                ]);
            }
        }

        return back()->with('success', "Maintenance log recorded for {$device->asset_tag}.");
    }

    /**
     * Update maintenance log status and post-repair assessment.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $log = MaintenanceLog::with('device')->findOrFail($id);

        $validated = $request->validate([
            'cost' => ['required', 'numeric', 'min:0'],
            'completed_at' => ['nullable', 'date'],
            'performance_assessment' => ['nullable', 'string'],
            'status' => ['required', 'in:scheduled,in_progress,completed,cancelled'],
            'restore_to_available' => ['nullable', 'boolean'],
        ]);

        $log->update($validated);

        // If completed and user wants to restore device to deployment/available
        if ($validated['status'] === 'completed' && !empty($validated['restore_to_available'])) {
            $device = $log->device;
            if ($device && $device->lifecycle_stage === 'maintenance') {
                $device->update([
                    'lifecycle_stage' => 'deployment',
                    'status' => $device->activeAssignment ? 'assigned' : 'available',
                ]);

                LifecycleEvent::create([
                    'device_id' => $device->id,
                    'from_stage' => 'maintenance',
                    'to_stage' => 'deployment',
                    'changed_by_user_id' => auth()->id(),
                    'notes' => "Completed {$log->type}: {$log->title}. Performance: {$validated['performance_assessment']}",
                ]);
            }
        }

        return back()->with('success', "Maintenance log updated successfully.");
    }
}
