<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\RoleProfile;
use App\Services\MatchingService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Employee::with(['roleProfile', 'activeAssignment.device']);

        if ($request->filled('search')) {
            $s = $request->input('search');
            $query->where(function ($q) use ($s) {
                $q->where('name', 'like', "%{$s}%")
                    ->orWhere('department', 'like', "%{$s}%")
                    ->orWhereHas('roleProfile', function ($rq) use ($s) {
                        $rq->where('name', 'like', "%{$s}%");
                    })
                    ->orWhereHas('activeAssignment.device', function ($dq) use ($s) {
                        $dq->where('brand', 'like', "%{$s}%")
                            ->orWhere('model', 'like', "%{$s}%")
                            ->orWhere('asset_tag', 'like', "%{$s}%");
                    });
            });
        }

        if ($request->filled('department')) {
            $query->where('department', $request->input('department'));
        }

        if ($request->filled('role_profile_id')) {
            $query->where('role_profile_id', $request->input('role_profile_id'));
        }

        if ($request->filled('hardware_status')) {
            $status = $request->input('hardware_status');
            if ($status === 'assigned') {
                $query->has('activeAssignment');
            } elseif ($status === 'unassigned') {
                $query->doesntHave('activeAssignment');
            }
        }

        $allowedSorts = [
            'name' => 'name',
            'employee' => 'name',
            'department' => 'department',
            'created_at' => 'created_at',
            'date' => 'created_at',
        ];

        $sort = $request->input('sort', 'name');
        $direction = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';
        $sortColumn = $allowedSorts[$sort] ?? 'name';

        $employees = $query->orderBy($sortColumn, $direction)->paginate(15)->withQueryString();

        $profiles = RoleProfile::orderBy('name')->get();
        $departments = Employee::whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');

        $totalEmployees = Employee::count();
        $assignedEmployees = Employee::has('activeAssignment')->count();
        $unassignedEmployees = Employee::doesntHave('activeAssignment')->count();
        $withProfileEmployees = Employee::whereNotNull('role_profile_id')->count();

        $stats = [
            'total' => $totalEmployees,
            'assigned' => $assignedEmployees,
            'unassigned' => $unassignedEmployees,
            'with_profile' => $withProfileEmployees,
            'assigned_percentage' => $totalEmployees > 0 ? (int) round(($assignedEmployees / $totalEmployees) * 100) : 0,
        ];

        return Inertia::render('Employees/Index', [
            'employees' => $employees,
            'role_profiles' => $profiles,
            'departments' => $departments,
            'stats' => $stats,
            'filters' => array_merge(
                $request->only(['search', 'department', 'role_profile_id', 'hardware_status']),
                ['sort' => $sort, 'direction' => $direction]
            ),
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

    /**
     * Offboard an employee, reclaim and sanitize their hardware asset, and return recirculation opportunities.
     */
    public function offboard(Request $request, int $id, MatchingService $matchingService): JsonResponse|RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:resignation,role_transition,hardware_upgrade,contract_end,other'],
            'condition' => ['required', 'string', 'in:excellent,good,fair,needs_repair'],
            'wipe_confirmed' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $result = $matchingService->reclaimDevice($id, $validated, auth()->id());

        if ($request->wantsJson()) {
            return response()->json($result);
        }

        return back()->with('success', $result['message'])
            ->with('reclaimed_details', $result);
    }

    /**
     * Export complete company staff directory and hardware allocation audit as PDF report.
     */
    public function exportPdf(Request $request)
    {
        Gate::authorize('exportPdf', Employee::class);

        $employees = Employee::with(['roleProfile', 'activeAssignment.device'])
            ->orderBy('name')
            ->get();

        $pdf = Pdf::loadView('reports.employees_directory', [
            'employees' => $employees,
            'generated_at' => now()->format('F j, Y, g:i A'),
            'total_employees' => $employees->count(),
            'assigned_count' => $employees->filter(fn ($e) => $e->activeAssignment !== null)->count(),
        ])->setPaper('a4', 'landscape');

        return $pdf->download('specmatch-staff-directory-'.date('Ymd-His').'.pdf');
    }
}
