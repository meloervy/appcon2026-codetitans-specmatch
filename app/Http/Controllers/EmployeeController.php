<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\RoleProfile;
use App\Services\MatchingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::with(['roleProfile', 'activeAssignment.device'])
            ->orderBy('name')
            ->get();

        $profiles = RoleProfile::orderBy('name')->get();

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'role_profiles' => $profiles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'department' => ['required', 'string', 'max:100'],
            'role_profile_id' => ['nullable', 'exists:role_profiles,id'],
            'notes' => ['nullable', 'string'],
        ]);

        Employee::create($validated);

        return back()->with('success', "Employee {$validated['name']} registered successfully.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $employee = Employee::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'department' => ['required', 'string', 'max:100'],
            'role_profile_id' => ['nullable', 'exists:role_profiles,id'],
            'notes' => ['nullable', 'string'],
        ]);

        $employee->update($validated);

        return back()->with('success', "Employee {$employee->name} updated successfully.");
    }

    public function unassign(int $id, MatchingService $matchingService): RedirectResponse
    {
        $employee = Employee::with('activeAssignment')->findOrFail($id);

        if ($employee->activeAssignment) {
            $matchingService->unassignDevice($employee->activeAssignment->id);
            return back()->with('success', "Device successfully unassigned from {$employee->name}.");
        }

        return back()->with('error', "Employee has no active device assignment.");
    }
}
