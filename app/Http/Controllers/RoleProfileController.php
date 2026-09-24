<?php

namespace App\Http\Controllers;

use App\Models\RoleProfile;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoleProfileController extends Controller
{
    public function index(): Response
    {
        $profiles = RoleProfile::withCount('employees')->orderBy('name')->get();

        return Inertia::render('RoleProfiles/Index', [
            'profiles' => $profiles,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:role_profiles,name'],
            'min_cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'min_ram_gb' => ['required', 'integer', 'min:4'],
            'min_storage_gb' => ['required', 'integer', 'min:64'],
            'requires_gpu' => ['required', 'boolean'],
            'min_gpu_tier' => ['nullable', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'portability_required' => ['required', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        if (empty($validated['requires_gpu'])) {
            $validated['min_gpu_tier'] = 'none';
        }

        RoleProfile::create($validated);

        return redirect()->route('role-profiles.index')->with('success', "Role profile '{$validated['name']}' created successfully.");
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $profile = RoleProfile::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:role_profiles,name,'.$profile->id],
            'min_cpu_tier' => ['required', 'in:entry,mid,high,workstation'],
            'min_ram_gb' => ['required', 'integer', 'min:4'],
            'min_storage_gb' => ['required', 'integer', 'min:64'],
            'requires_gpu' => ['required', 'boolean'],
            'min_gpu_tier' => ['nullable', 'in:none,integrated,dedicated-entry,dedicated-high'],
            'portability_required' => ['required', 'boolean'],
            'description' => ['nullable', 'string'],
        ]);

        if (empty($validated['requires_gpu'])) {
            $validated['min_gpu_tier'] = 'none';
        }

        $profile->update($validated);

        return back()->with('success', "Role profile '{$profile->name}' updated successfully.");
    }

    public function destroy(int $id): RedirectResponse
    {
        $profile = RoleProfile::findOrFail($id);
        $profile->delete();

        return back()->with('success', 'Role profile deleted.');
    }
}
