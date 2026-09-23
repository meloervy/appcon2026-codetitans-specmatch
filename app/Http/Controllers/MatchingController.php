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

        return Inertia::render('Match/Request', [
            'employees' => $employees,
            'role_profiles' => $profiles,
            'recent_requests' => $recentRequests,
            'selected_employee_id' => $request->integer('employee_id'),
        ]);
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
        ]);

        $results = $matchingService->rankDevices(
            $validated['requirements'],
            $validated['exclude_device_id'] ?? null,
            true // available only
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
}
