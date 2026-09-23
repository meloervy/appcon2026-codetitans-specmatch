<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\RoleProfile;
use App\Services\MatchingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'profile_picture' => ['nullable'],
            'profile_picture_file' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,gif,svg', 'max:5120'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('profile_picture_file')) {
            $file = $request->file('profile_picture_file');
            $filename = 'emp_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $destination = public_path('user/uploads');
            if (! file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $validated['profile_picture'] = 'public/user/uploads/'.$filename;
        } elseif ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'emp_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $destination = public_path('user/uploads');
            if (! file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $validated['profile_picture'] = 'public/user/uploads/'.$filename;
        } elseif (isset($validated['profile_picture']) && is_string($validated['profile_picture']) && trim($validated['profile_picture']) !== '') {
            $validated['profile_picture'] = trim($validated['profile_picture']);
        } else {
            unset($validated['profile_picture']);
        }

        unset($validated['profile_picture_file']);

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
            'profile_picture' => ['nullable'],
            'profile_picture_file' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp,gif,svg', 'max:5120'],
            'notes' => ['nullable', 'string'],
        ]);

        if ($request->hasFile('profile_picture_file')) {
            $file = $request->file('profile_picture_file');
            $filename = 'emp_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $destination = public_path('user/uploads');
            if (! file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $validated['profile_picture'] = 'public/user/uploads/'.$filename;
        } elseif ($request->hasFile('profile_picture')) {
            $file = $request->file('profile_picture');
            $filename = 'emp_'.time().'_'.Str::random(8).'.'.$file->getClientOriginalExtension();
            $destination = public_path('user/uploads');
            if (! file_exists($destination)) {
                mkdir($destination, 0755, true);
            }
            $file->move($destination, $filename);
            $validated['profile_picture'] = 'public/user/uploads/'.$filename;
        } elseif (isset($validated['profile_picture']) && is_string($validated['profile_picture']) && trim($validated['profile_picture']) !== '') {
            $validated['profile_picture'] = trim($validated['profile_picture']);
        } elseif ($request->has('profile_picture') && empty($request->input('profile_picture'))) {
            $validated['profile_picture'] = 'public/user/default-profile-picture.png';
        } else {
            unset($validated['profile_picture']);
        }

        unset($validated['profile_picture_file']);

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

        return back()->with('error', 'Employee has no active device assignment.');
    }
}
