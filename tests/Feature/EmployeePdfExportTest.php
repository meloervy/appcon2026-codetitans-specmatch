<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\Employee;
use App\Models\RoleProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeePdfExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_export_employees_pdf(): void
    {
        $response = $this->get('/employees/export/pdf');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_export_employees_pdf(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $roleProfile = RoleProfile::create([
            'name' => 'Fullstack Engineer',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'min_cpu_tier' => 'mid',
        ]);

        $employee = Employee::create([
            'name' => 'Juan Dela Cruz',
            'department' => 'Engineering',
            'role_profile_id' => $roleProfile->id,
            'notes' => 'Senior developer onboarded 2024',
        ]);

        $device = Device::create([
            'asset_tag' => 'TEST-001',
            'serial_number' => 'SN-TEST-001',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 14',
            'device_type' => 'laptop',
            'location' => 'BGC, Taguig City',
            'cpu' => 'Apple M2 Pro',
            'cpu_tier' => 'high',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'year_acquired' => 2023,
            'purchase_cost' => 120000.00,
            'purchase_date' => '2023-01-01',
            'depreciation_rate_percent' => 20.0,
            'status' => 'assigned',
            'condition' => 'excellent',
            'lifecycle_stage' => 'deployment',
        ]);

        \App\Models\Assignment::create([
            'employee_id' => $employee->id,
            'device_id' => $device->id,
            'assigned_at' => now(),
            'match_score' => 95.5,
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($user)->get('/employees/export/pdf');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('specmatch-staff-directory-', $response->headers->get('content-disposition'));
    }

    public function test_authenticated_user_can_view_employees_index_with_stats_and_filters(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $roleProfile = RoleProfile::create([
            'name' => 'Designer',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'min_cpu_tier' => 'mid',
        ]);

        Employee::create([
            'name' => 'Maria Santos',
            'department' => 'Creative',
            'role_profile_id' => $roleProfile->id,
        ]);

        $response = $this->actingAs($user)->get(route('employees.index', [
            'search' => 'Maria',
            'department' => 'Creative',
            'hardware_status' => 'unassigned',
        ]));

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Employees/Index')
            ->has('employees.data', 1)
            ->has('stats')
            ->has('departments')
            ->has('role_profiles')
            ->where('stats.total', 1)
            ->where('stats.unassigned', 1)
        );
    }
}
