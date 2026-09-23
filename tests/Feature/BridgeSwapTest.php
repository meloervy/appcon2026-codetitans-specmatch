<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\RoleProfile;
use App\Models\User;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BridgeSwapTest extends TestCase
{
    use RefreshDatabase;

    private MatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new MatchingService;
    }

    public function test_bridge_swap_detected_when_donor_is_overprovisioned_and_stockroom_has_baseline_unit(): void
    {
        // 1. Roles
        $clerkRole = RoleProfile::create([
            'name' => 'Clerk',
            'department' => 'Operations',
            'min_cpu_tier' => 'entry',
            'min_ram_gb' => 8,
            'min_storage_gb' => 256,
            'requires_gpu' => false,
            'portability_required' => false,
        ]);

        $editorRole = RoleProfile::create([
            'name' => 'Video Editor',
            'department' => 'Media',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-entry',
            'portability_required' => false,
        ]);

        // 2. High-spec device assigned to Clerk (Overprovisioned!)
        $workstation = Device::create([
            'asset_tag' => 'WRK-001',
            'device_type' => 'desktop',
            'brand' => 'Dell',
            'model' => 'Precision 7960',
            'cpu' => 'Intel Xeon',
            'cpu_tier' => 'workstation',
            'ram_gb' => 64,
            'storage_type' => 'SSD',
            'storage_gb' => 2048,
            'gpu' => 'NVIDIA RTX 4000',
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'purchase_cost' => 180000.00,
            'condition' => 'excellent',
            'status' => 'assigned',
            'location' => 'BGC, Taguig',
        ]);

        $clerk = Employee::create([
            'name' => 'John Clerk',
            'department' => 'Operations',
            'role_profile_id' => $clerkRole->id,
            'location' => 'BGC, Taguig',
        ]);

        Assignment::create([
            'device_id' => $workstation->id,
            'employee_id' => $clerk->id,
            'assigned_at' => now(),
            'assignment_source' => 'manual_override',
        ]);

        // 3. Baseline idle unit in stockroom
        $stockroomUnit = Device::create([
            'asset_tag' => 'STK-001',
            'device_type' => 'desktop',
            'brand' => 'HP',
            'model' => 'ProDesk 400',
            'cpu' => 'Intel Core i3',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_type' => 'SSD',
            'storage_gb' => 256,
            'gpu' => null,
            'gpu_tier' => 'none',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
            'location' => 'BGC, Taguig',
        ]);

        // 4. New Video Editor requester
        $editor = Employee::create([
            'name' => 'Sarah Editor',
            'department' => 'Media',
            'role_profile_id' => $editorRole->id,
            'location' => 'BGC, Taguig',
        ]);

        $requirements = [
            'min_cpu_tier' => $editorRole->min_cpu_tier,
            'min_ram_gb' => $editorRole->min_ram_gb,
            'min_storage_gb' => $editorRole->min_storage_gb,
            'requires_gpu' => $editorRole->requires_gpu,
            'min_gpu_tier' => $editorRole->min_gpu_tier,
            'portability_required' => $editorRole->portability_required,
        ];

        // Direct matching stockroom: stockroomUnit cannot fulfill video editor
        $directMatches = $this->service->rankDevices($requirements, null, true);
        $this->assertTrue($directMatches['procurement_recommended']);

        // Dynamic Bridge Swap should find the opportunity
        $bridgeSwaps = $this->service->findBridgeSwaps($requirements, $editor->id);

        $this->assertNotEmpty($bridgeSwaps);
        $swap = $bridgeSwaps[0];

        $this->assertEquals($clerk->id, $swap['donor_employee']['id']);
        $this->assertEquals($workstation->id, $swap['donor_device']['id']);
        $this->assertEquals($stockroomUnit->id, $swap['bridge_device']['id']);
        $this->assertGreaterThanOrEqual(0.65, $swap['feasibility_score']);
        $this->assertEquals(180000.00, $swap['capex_saved_php']);
        $this->assertTrue($swap['same_location']);
        $this->assertStringContainsString('Dynamic Bridge Swap', $swap['rationale']);
    }

    public function test_bridge_swap_requires_authentication(): void
    {
        $response = $this->post('/match/bridge-swap', [
            'bridge_device_id' => 1,
            'donor_employee_id' => 1,
            'requester_employee_id' => 2,
            'donor_device_id' => 2,
        ]);

        $response->assertRedirect('/login');
    }

    public function test_execute_bridge_swap_atomically_updates_assignments_and_lifecycle_events(): void
    {
        $user = User::factory()->create();

        $bridgeDevice = Device::create([
            'asset_tag' => 'DEV-BRG',
            'device_type' => 'laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad T14',
            'cpu' => 'AMD Ryzen 5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
            'lifecycle_stage' => 'acquisition',
        ]);

        $donorDevice = Device::create([
            'asset_tag' => 'DEV-DNR',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16',
            'cpu' => 'M3 Max',
            'cpu_tier' => 'high',
            'ram_gb' => 36,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'year_acquired' => 2024,
            'purchase_cost' => 160000.00,
            'condition' => 'excellent',
            'status' => 'assigned',
            'lifecycle_stage' => 'deployment',
        ]);

        $donor = Employee::create([
            'name' => 'Alice Donor',
            'department' => 'Support',
        ]);

        $requester = Employee::create([
            'name' => 'Bob Requester',
            'department' => 'Engineering',
        ]);

        $initialAssignment = Assignment::create([
            'device_id' => $donorDevice->id,
            'employee_id' => $donor->id,
            'assigned_at' => now()->subMonths(3),
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($user)->post('/match/bridge-swap', [
            'bridge_device_id' => $bridgeDevice->id,
            'donor_employee_id' => $donor->id,
            'requester_employee_id' => $requester->id,
            'donor_device_id' => $donorDevice->id,
        ]);

        $response->assertRedirect('/dashboard');
        $response->assertSessionHas('success');

        // Check Donor reassignment
        $this->assertNotNull($initialAssignment->fresh()->unassigned_at);
        $donorActiveAssignment = Assignment::where('employee_id', $donor->id)
            ->whereNull('unassigned_at')
            ->first();
        $this->assertNotNull($donorActiveAssignment);
        $this->assertEquals($bridgeDevice->id, $donorActiveAssignment->device_id);

        // Check Requester reassignment
        $requesterActiveAssignment = Assignment::where('employee_id', $requester->id)
            ->whereNull('unassigned_at')
            ->first();
        $this->assertNotNull($requesterActiveAssignment);
        $this->assertEquals($donorDevice->id, $requesterActiveAssignment->device_id);

        // Check device statuses & lifecycle stages
        $this->assertEquals('assigned', $bridgeDevice->fresh()->status);
        $this->assertEquals('deployment', $bridgeDevice->fresh()->lifecycle_stage);

        $this->assertEquals('assigned', $donorDevice->fresh()->status);
        $this->assertEquals('deployment', $donorDevice->fresh()->lifecycle_stage);

        // Check LifecycleEvents audit trail
        $this->assertDatabaseHas('lifecycle_events', [
            'device_id' => $bridgeDevice->id,
            'to_stage' => 'deployment',
        ]);

        $this->assertDatabaseHas('lifecycle_events', [
            'device_id' => $donorDevice->id,
            'to_stage' => 'deployment',
        ]);
    }

    public function test_match_rank_api_returns_bridge_swaps(): void
    {
        $user = User::factory()->create();

        $role = RoleProfile::create([
            'name' => 'Data Analyst',
            'department' => 'Analytics',
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'portability_required' => true,
        ]);

        $employee = Employee::create([
            'name' => 'Test Employee',
            'department' => 'Analytics',
            'role_profile_id' => $role->id,
        ]);

        $response = $this->actingAs($user)->postJson('/match/rank', [
            'employee_id' => $employee->id,
            'requirements' => [
                'min_cpu_tier' => 'high',
                'min_ram_gb' => 32,
                'min_storage_gb' => 1024,
                'requires_gpu' => false,
                'min_gpu_tier' => 'none',
                'portability_required' => true,
            ],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results',
            'procurement_recommended',
            'total_capex_savings_php',
            'threshold',
            'bridge_swaps',
        ]);
    }
}
