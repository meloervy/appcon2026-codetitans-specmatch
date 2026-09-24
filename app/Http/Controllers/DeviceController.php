<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\LifecycleEvent;
use App\Services\MatchingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Device::with(['activeAssignment.employee.roleProfile', 'maintenanceLogs']);

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('asset_tag', 'like', "%{$s}%")
                    ->orWhere('serial_number', 'like', "%{$s}%")
                    ->orWhere('brand', 'like', "%{$s}%")
                    ->orWhere('model', 'like', "%{$s}%")
                    ->orWhere('cpu', 'like', "%{$s}%")
                    ->orWhere('location', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('lifecycle_stage')) {
            $query->where('lifecycle_stage', $request->input('lifecycle_stage'));
        }

        if ($request->filled('device_type')) {
            $query->where('device_type', $request->input('device_type'));
        }

        if ($request->filled('cpu_tier')) {
            $query->where('cpu_tier', $request->input('cpu_tier'));
        }

        if ($request->filled('condition')) {
            $query->where('condition', $request->input('condition'));
        }

        $allowedSorts = [
            'created_at' => 'created_at',
            'date' => 'created_at',
            'tag' => 'asset_tag',
            'asset_tag' => 'asset_tag',
            'model' => 'model',
            'brand' => 'brand',
            'specs' => 'ram_gb',
            'ram_gb' => 'ram_gb',
            'storage_gb' => 'storage_gb',
            'location' => 'location',
            'lifecycle' => 'lifecycle_stage',
            'lifecycle_stage' => 'lifecycle_stage',
            'status' => 'status',
            'warranty' => 'warranty_expiry',
            'warranty_expiry' => 'warranty_expiry',
            'year_acquired' => 'year_acquired',
            'purchase_date' => 'purchase_date',
        ];

        $sort = $request->input('sort', 'asset_tag');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortColumn = $allowedSorts[$sort] ?? 'asset_tag';

        $devices = $query->orderBy($sortColumn, $direction)->paginate(15)->withQueryString();

        return Inertia::render('Devices/Index', [
            'devices' => $devices,
            'filters' => array_merge(
                $request->only(['search', 'status', 'lifecycle_stage', 'device_type', 'cpu_tier', 'condition']),
                ['sort' => $sort, 'direction' => $direction]
            ),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Devices/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'asset_tag' => ['required', 'string', 'max:50', 'unique:devices,asset_tag'],
            'serial_number' => ['nullable', 'string', 'max:100', 'unique:devices,serial_number'],
            'barcode' => ['nullable', 'string', 'max:100'],
            'techspecs_id' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'device_type' => ['required', 'in:laptop,desktop'],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:150'],
            'cpu' => ['required', 'string', 'max:150'],
            'cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'ram_gb' => ['required', 'integer', 'min:1'],
            'storage_type' => ['required', 'in:HDD,SSD'],
            'storage_gb' => ['required', 'integer', 'min:1'],
            'gpu' => ['nullable', 'string', 'max:150'],
            'gpu_tier' => ['required', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'year_acquired' => ['required', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'depreciation_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'vendor' => ['nullable', 'string', 'max:100'],
            'warranty_start' => ['nullable', 'date'],
            'warranty_expiry' => ['nullable', 'date'],
            'contract_sla' => ['nullable', 'string', 'max:100'],
            'condition' => ['required', 'in:excellent,good,fair,needs_repair,retired'],
            'status' => ['required', 'in:available,assigned,in_repair,retired'],
            'lifecycle_stage' => ['nullable', 'in:acquisition,deployment,reclaimed,maintenance,retirement'],
            'notes' => ['nullable', 'string'],
        ]);

        $validated['lifecycle_stage'] = $validated['lifecycle_stage'] ?? 'deployment';

        $device = Device::create($validated);

        // Record initial lifecycle event
        LifecycleEvent::create([
            'device_id' => $device->id,
            'from_stage' => 'new',
            'to_stage' => $device->lifecycle_stage,
            'changed_by_user_id' => auth()->id(),
            'notes' => 'Asset registered into ITAM inventory.',
        ]);

        return redirect()->route('devices.index')->with('success', "Device {$validated['asset_tag']} successfully registered.");
    }

    public function show(int $id): Response
    {
        $device = Device::with([
            'assignments.employee',
            'activeAssignment.employee',
            'maintenanceLogs',
            'lifecycleEvents.user',
        ])->findOrFail($id);

        return Inertia::render('Devices/Show', [
            'device' => $device,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $device = Device::findOrFail($id);

        $validated = $request->validate([
            'asset_tag' => ['required', 'string', 'max:50', 'unique:devices,asset_tag,'.$device->id],
            'serial_number' => ['nullable', 'string', 'max:100', 'unique:devices,serial_number,'.$device->id],
            'barcode' => ['nullable', 'string', 'max:100'],
            'techspecs_id' => ['nullable', 'string', 'max:100'],
            'image_url' => ['nullable', 'string', 'max:500'],
            'device_type' => ['required', 'in:laptop,desktop'],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'location' => ['nullable', 'string', 'max:150'],
            'cpu' => ['required', 'string', 'max:150'],
            'cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'ram_gb' => ['required', 'integer', 'min:1'],
            'storage_type' => ['required', 'in:HDD,SSD'],
            'storage_gb' => ['required', 'integer', 'min:1'],
            'gpu' => ['nullable', 'string', 'max:150'],
            'gpu_tier' => ['required', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'year_acquired' => ['required', 'integer', 'min:2000', 'max:'.(date('Y') + 1)],
            'purchase_cost' => ['nullable', 'numeric', 'min:0'],
            'purchase_date' => ['nullable', 'date'],
            'depreciation_rate_percent' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'vendor' => ['nullable', 'string', 'max:100'],
            'warranty_start' => ['nullable', 'date'],
            'warranty_expiry' => ['nullable', 'date'],
            'contract_sla' => ['nullable', 'string', 'max:100'],
            'condition' => ['required', 'in:excellent,good,fair,needs_repair,retired'],
            'status' => ['required', 'in:available,assigned,in_repair,retired'],
            'lifecycle_stage' => ['required', 'in:acquisition,deployment,reclaimed,maintenance,retirement'],
            'notes' => ['nullable', 'string'],
        ]);

        $oldStage = $device->lifecycle_stage;
        $device->update($validated);

        if ($oldStage !== $validated['lifecycle_stage']) {
            LifecycleEvent::create([
                'device_id' => $device->id,
                'from_stage' => $oldStage,
                'to_stage' => $validated['lifecycle_stage'],
                'changed_by_user_id' => auth()->id(),
                'notes' => 'Lifecycle stage updated via asset edit.',
            ]);
        }

        return back()->with('success', "Device {$device->asset_tag} updated successfully.");
    }

    /**
     * Transition asset lifecycle stage with audit notes.
     */
    public function updateLifecycle(Request $request, int $id): RedirectResponse
    {
        $device = Device::findOrFail($id);

        $validated = $request->validate([
            'to_stage' => ['required', 'in:acquisition,deployment,reclaimed,maintenance,retirement'],
            'notes' => ['nullable', 'string'],
        ]);

        $fromStage = $device->lifecycle_stage;
        $toStage = $validated['to_stage'];

        // Synchronize device status
        $newStatus = $device->status;
        if ($toStage === 'maintenance') {
            $newStatus = 'in_repair';
        } elseif ($toStage === 'retirement') {
            $newStatus = 'retired';
            if ($device->activeAssignment) {
                $device->activeAssignment->update(['unassigned_at' => now()]);
            }
        } elseif ($toStage === 'reclaimed') {
            $newStatus = 'available';
            if ($device->activeAssignment) {
                $device->activeAssignment->update(['unassigned_at' => now()]);
            }
        } elseif ($toStage === 'deployment' && $device->status === 'in_repair') {
            $newStatus = $device->activeAssignment ? 'assigned' : 'available';
        }

        $device->update([
            'lifecycle_stage' => $toStage,
            'status' => $newStatus,
            'condition' => ($toStage === 'retirement') ? 'retired' : $device->condition,
        ]);

        LifecycleEvent::create([
            'device_id' => $device->id,
            'from_stage' => $fromStage,
            'to_stage' => $toStage,
            'changed_by_user_id' => auth()->id(),
            'notes' => $validated['notes'] ?? 'Stage transitioned by IT Staff.',
        ]);

        return back()->with('success', "Asset {$device->asset_tag} transitioned to {$toStage} stage.");
    }

    /**
     * Directly reclaim a device back into the pool and discover recirculation opportunities.
     */
    public function reclaim(Request $request, int $id, MatchingService $matchingService): JsonResponse|RedirectResponse
    {
        $device = Device::with('activeAssignment.employee')->findOrFail($id);

        if ($device->activeAssignment && $device->activeAssignment->employee) {
            $validated = $request->validate([
                'reason' => ['nullable', 'string', 'in:resignation,role_transition,hardware_upgrade,contract_end,other'],
                'condition' => ['nullable', 'string', 'in:excellent,good,fair,needs_repair'],
                'wipe_confirmed' => ['nullable', 'boolean'],
                'notes' => ['nullable', 'string', 'max:1000'],
            ]);

            $result = $matchingService->reclaimDevice($device->activeAssignment->employee->id, [
                'reason' => $validated['reason'] ?? 'hardware_upgrade',
                'condition' => $validated['condition'] ?? $device->condition,
                'wipe_confirmed' => $validated['wipe_confirmed'] ?? true,
                'notes' => $validated['notes'] ?? 'Direct asset reclamation to stockroom.',
            ], auth()->id());

            if ($request->wantsJson()) {
                return response()->json($result);
            }

            return back()->with('success', $result['message'])->with('reclaimed_details', $result);
        }

        $fromStage = $device->lifecycle_stage;
        $device->update([
            'status' => 'available',
            'lifecycle_stage' => 'reclaimed',
        ]);

        LifecycleEvent::create([
            'device_id' => $device->id,
            'from_stage' => $fromStage,
            'to_stage' => 'reclaimed',
            'changed_by_user_id' => auth()->id(),
            'notes' => 'Asset returned to pool in reclaimed stage.',
        ]);

        $circulation = $matchingService->findRecirculationMatches($device);

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Device {$device->asset_tag} returned to pool in reclaimed stage.",
                'device' => $device->fresh(),
                'circulation_matches' => $circulation,
            ]);
        }

        return back()->with('success', "Device {$device->asset_tag} returned to pool in reclaimed stage.");
    }

    public function retire(int $id): RedirectResponse
    {
        $device = Device::findOrFail($id);

        if ($device->activeAssignment) {
            $device->activeAssignment->update(['unassigned_at' => now()]);
        }

        $oldStage = $device->lifecycle_stage;
        $device->update([
            'status' => 'retired',
            'condition' => 'retired',
            'lifecycle_stage' => 'retirement',
        ]);

        LifecycleEvent::create([
            'device_id' => $device->id,
            'from_stage' => $oldStage,
            'to_stage' => 'retirement',
            'changed_by_user_id' => auth()->id(),
            'notes' => 'Asset decommissioned and retired from active fleet.',
        ]);

        return back()->with('success', "Device {$device->asset_tag} has been retired.");
    }

    /**
     * Export complete hardware asset inventory as a compliance PDF report.
     */
    public function exportPdf(Request $request)
    {
        $devices = Device::with('activeAssignment.employee')
            ->orderBy('asset_tag')
            ->get();

        $pdf = Pdf::loadView('reports.devices_inventory', [
            'devices' => $devices,
            'generated_at' => now()->format('F j, Y, g:i A'),
            'total_assets' => $devices->count(),
            'total_value' => $devices->sum(fn ($d) => $d->current_book_value),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('specmatch-itam-inventory-'.date('Ymd-His').'.pdf');
    }
}
