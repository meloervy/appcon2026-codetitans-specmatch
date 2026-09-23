<?php

namespace App\Http\Controllers;

use App\Models\Device;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Device::with('activeAssignment.employee');

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('asset_tag', 'like', "%{$s}%")
                  ->orWhere('brand', 'like', "%{$s}%")
                  ->orWhere('model', 'like', "%{$s}%")
                  ->orWhere('cpu', 'like', "%{$s}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
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

        $devices = $query->orderBy('asset_tag')->paginate(15)->withQueryString();

        return Inertia::render('Devices/Index', [
            'devices' => $devices,
            'filters' => $request->only(['search', 'status', 'device_type', 'cpu_tier', 'condition']),
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
            'device_type' => ['required', 'in:laptop,desktop'],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'cpu' => ['required', 'string', 'max:150'],
            'cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'ram_gb' => ['required', 'integer', 'min:1'],
            'storage_type' => ['required', 'in:HDD,SSD'],
            'storage_gb' => ['required', 'integer', 'min:1'],
            'gpu' => ['nullable', 'string', 'max:150'],
            'gpu_tier' => ['required', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'year_acquired' => ['required', 'integer', 'min:2000', 'max:' . (date('Y') + 1)],
            'condition' => ['required', 'in:excellent,good,fair,needs_repair,retired'],
            'status' => ['required', 'in:available,assigned,in_repair,retired'],
            'notes' => ['nullable', 'string'],
        ]);

        Device::create($validated);

        return redirect()->route('devices.index')->with('success', "Device {$validated['asset_tag']} successfully registered.");
    }

    public function show(int $id): Response
    {
        $device = Device::with(['assignments.employee', 'activeAssignment.employee'])->findOrFail($id);

        return Inertia::render('Devices/Show', [
            'device' => $device,
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $device = Device::findOrFail($id);

        $validated = $request->validate([
            'asset_tag' => ['required', 'string', 'max:50', 'unique:devices,asset_tag,' . $device->id],
            'device_type' => ['required', 'in:laptop,desktop'],
            'brand' => ['required', 'string', 'max:100'],
            'model' => ['required', 'string', 'max:100'],
            'cpu' => ['required', 'string', 'max:150'],
            'cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'ram_gb' => ['required', 'integer', 'min:1'],
            'storage_type' => ['required', 'in:HDD,SSD'],
            'storage_gb' => ['required', 'integer', 'min:1'],
            'gpu' => ['nullable', 'string', 'max:150'],
            'gpu_tier' => ['required', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'year_acquired' => ['required', 'integer', 'min:2000', 'max:' . (date('Y') + 1)],
            'condition' => ['required', 'in:excellent,good,fair,needs_repair,retired'],
            'status' => ['required', 'in:available,assigned,in_repair,retired'],
            'notes' => ['nullable', 'string'],
        ]);

        $device->update($validated);

        return back()->with('success', "Device {$device->asset_tag} updated successfully.");
    }

    public function retire(int $id): RedirectResponse
    {
        $device = Device::findOrFail($id);

        // Unassign if currently assigned
        if ($device->activeAssignment) {
            $device->activeAssignment->update(['unassigned_at' => now()]);
        }

        $device->update([
            'status' => 'retired',
            'condition' => 'retired',
        ]);

        return back()->with('success', "Device {$device->asset_tag} has been retired.");
    }
}
