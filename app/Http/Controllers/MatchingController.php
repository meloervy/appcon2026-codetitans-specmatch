<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Employee;
use App\Models\MatchRequest;
use App\Models\RoleProfile;
use App\Services\GeminiService;
use App\Services\MatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MatchingController extends Controller
{
    public function index(Request $request): Response
    {
        $employees = Employee::with(['roleProfile', 'activeAssignment.device'])->orderBy('name')->get();
        $profiles = RoleProfile::orderBy('name')->get();
        $recentRequests = MatchRequest::with('employee')->latest('id')->take(5)->get();

        $availableDevices = Device::where('status', 'available')->orderBy('cpu_tier')->get();
        $deployableSummary = [
            'total_available' => $availableDevices->count(),
            'laptops_count' => $availableDevices->where('device_type', 'laptop')->count(),
            'desktops_count' => $availableDevices->where('device_type', 'desktop')->count(),
            'tiers' => [
                'entry' => $availableDevices->where('cpu_tier', 'entry')->count(),
                'mid' => $availableDevices->where('cpu_tier', 'mid')->count(),
                'high' => $availableDevices->where('cpu_tier', 'high')->count(),
                'workstation' => $availableDevices->where('cpu_tier', 'workstation')->count(),
            ],
            'locations' => $availableDevices->pluck('location')->unique()->filter()->values(),
            'preview_devices' => $availableDevices->map(fn ($d) => [
                'id' => $d->id,
                'asset_tag' => $d->asset_tag,
                'brand' => $d->brand,
                'model' => $d->model,
                'device_type' => $d->device_type,
                'cpu' => $d->cpu,
                'cpu_tier' => $d->cpu_tier,
                'ram_gb' => $d->ram_gb,
                'storage_gb' => $d->storage_gb,
                'storage_type' => $d->storage_type,
                'gpu' => $d->gpu,
                'gpu_tier' => $d->gpu_tier,
                'location' => $d->location,
                'condition' => $d->condition,
                'lifecycle_stage' => $d->lifecycle_stage,
                'status' => $d->status,
                'image_clip_url' => $d->image_clip_url,
            ]),
        ];

        return Inertia::render('Match/Request', [
            'employees' => $employees,
            'role_profiles' => $profiles,
            'recent_requests' => $recentRequests,
            'selected_employee_id' => $request->integer('employee_id'),
            'deployable_summary' => $deployableSummary,
        ]);
    }

    /**
     * Test connectivity specifically to Gemini 3.6 Flash.
     */
    public function testGemini(Request $request, GeminiService $geminiService): JsonResponse
    {
        $model = $request->input('model', 'gemini-3.6-flash');
        $result = $geminiService->testConnectivity($model);

        return response()->json($result);
    }

    /**
     * Layer 1: Extract requirements from free-form text using GeminiService.
     */
    public function extract(Request $request, GeminiService $geminiService): JsonResponse
    {
        $validated = $request->validate([
            'raw_input' => ['required', 'string', 'min:3'],
            'employee_id' => ['nullable', 'exists:employees,id'],
        ]);

        $extracted = $geminiService->extractRequirements(
            $validated['raw_input'],
            $validated['employee_id'] ?? null
        );

        return response()->json([
            'success' => true,
            'requirements' => $extracted,
        ]);
    }

    /**
     * Layer 2: Rank eligible fleet devices using deterministic MatchingService.
     */
    public function rank(Request $request, MatchingService $matchingService): JsonResponse
    {
        $validated = $request->validate([
            'requirements' => ['required', 'array'],
            'requirements.min_cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'requirements.min_ram_gb' => ['required', 'integer', 'min:4'],
            'requirements.min_storage_gb' => ['required', 'integer', 'min:64'],
            'requirements.requires_gpu' => ['required', 'boolean'],
            'requirements.min_gpu_tier' => ['nullable', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'requirements.portability_required' => ['required', 'boolean'],
            'exclude_device_id' => ['nullable', 'integer'],
            'employee_id' => ['nullable', 'integer', 'exists:employees,id'],
        ]);

        $results = $matchingService->rankDevices(
            $validated['requirements'],
            $validated['exclude_device_id'] ?? null,
            true // available only
        );

        $results['bridge_swaps'] = $matchingService->findBridgeSwaps(
            $validated['requirements'],
            $validated['employee_id'] ?? null
        );

        return response()->json($results);
    }

    /**
     * Complete assignment transaction.
     */
    public function assign(Request $request, MatchingService $matchingService): RedirectResponse
    {
        $validated = $request->validate([
            'device_id' => ['required', 'exists:devices,id'],
            'employee_id' => ['required', 'exists:employees,id'],
            'assignment_source' => ['required', 'in:ai_recommended,manual_override'],
            'match_score' => ['nullable', 'numeric', 'min:0', 'max:1'],
        ]);

        $assignment = $matchingService->assignDevice(
            $validated['device_id'],
            $validated['employee_id'],
            $validated['assignment_source'],
            $validated['match_score'] ?? null
        );

        $employee = Employee::find($validated['employee_id']);
        $device = Device::find($validated['device_id']);

        return redirect()->route('dashboard')->with(
            'success',
            "Device {$device->asset_tag} ({$device->brand} {$device->model}) assigned to {$employee->name}."
        );
    }

    /**
     * Atomically execute a 2-step bridge swap cascade transaction.
     */
    public function executeBridgeSwap(Request $request, MatchingService $matchingService): RedirectResponse
    {
        $validated = $request->validate([
            'bridge_device_id' => ['required', 'exists:devices,id'],
            'donor_employee_id' => ['required', 'exists:employees,id'],
            'requester_employee_id' => ['required', 'exists:employees,id'],
            'donor_device_id' => ['required', 'exists:devices,id'],
        ]);

        $result = $matchingService->executeBridgeSwap(
            $validated['bridge_device_id'],
            $validated['donor_employee_id'],
            $validated['requester_employee_id'],
            $validated['donor_device_id'],
            auth()->id()
        );

        $donor = $result['donor'];
        $requester = $result['requester'];
        $bridgeDevice = $result['bridge_device'];
        $donorDevice = $result['donor_device'];
        $savings = number_format($matchingService->estimateDeviceValuePhp($donorDevice), 2);

        return redirect()->route('dashboard')->with(
            'success',
            "Dynamic Bridge Swap executed! Deployed stockroom unit {$bridgeDevice->asset_tag} to {$donor->name}, freeing up {$donorDevice->asset_tag} for {$requester->name}. Avoided ₱{$savings} in new hardware CapEx!"
        );
    }

    /**
     * Simulate hypothetical headcount and role requirements against current stockroom inventory.
     */
    public function simulate(Request $request, MatchingService $matchingService): JsonResponse
    {
        $validated = $request->validate([
            'requirements' => ['required', 'array'],
            'requirements.min_cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'requirements.min_ram_gb' => ['required', 'integer', 'min:4'],
            'requirements.min_storage_gb' => ['required', 'integer', 'min:64'],
            'requirements.requires_gpu' => ['required', 'boolean'],
            'requirements.min_gpu_tier' => ['nullable', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'requirements.portability_required' => ['required', 'boolean'],
            'quantity' => ['required', 'integer', 'min:1', 'max:50'],
        ]);

        $simulation = $matchingService->simulateHeadcount(
            $validated['requirements'],
            $validated['quantity']
        );

        return response()->json($simulation);
    }
}
