<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\RoleProfile;
use App\Models\User;
use App\Services\ItamTrackingService;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdvancedItamFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_reclaim_device_transitions_to_reclaimed_stage_and_finds_circulation_matches(): void
    {
        $user = User::factory()->create();
        $matchingService = app(MatchingService::class);

        $roleProfile = RoleProfile::create([
            'name' => 'Software Engineer',
            'department' => 'Engineering',
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'portability_required' => true,
        ]);

        $employee = Employee::create([
            'name' => 'Alice Offboarder',
            'department' => 'Engineering',
            'role_profile_id' => $roleProfile->id,
        ]);

        $device = Device::create([
            'asset_tag' => 'SM-LAP-099',
            'brand' => 'Dell',
            'model' => 'Latitude 5430',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i7-1265U',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'assigned',
            'lifecycle_stage' => 'deployment',
            'purchase_cost' => 65000.00,
        ]);

        Assignment::create([
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'assigned_at' => now()->subMonths(6),
            'assignment_source' => 'manual_override',
        ]);

        // Waiting employee who needs a machine
        $waitingEmployee = Employee::create([
            'name' => 'Bob Waiting',
            'department' => 'Engineering',
            'role_profile_id' => $roleProfile->id,
        ]);

        $this->actingAs($user);

        $response = $this->postJson(route('employees.offboard', $employee->id), [
            'reason' => 'resignation',
            'condition' => 'good',
            'wipe_confirmed' => true,
            'notes' => 'Handed over in full working condition with charger.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('success', true);
        $response->assertJsonPath('device.lifecycle_stage', 'reclaimed');
        $response->assertJsonPath('device.status', 'available');

        // Check circulation match
        $matches = $response->json('circulation_matches');
        $this->assertNotEmpty($matches);
        $this->assertEquals($waitingEmployee->id, $matches[0]['employee_id']);

        // Verify lifecycle event recorded
        $this->assertDatabaseHas('lifecycle_events', [
            'device_id' => $device->id,
            'from_stage' => 'deployment',
            'to_stage' => 'reclaimed',
        ]);
    }

    public function test_reclaim_device_with_needs_repair_moves_to_maintenance(): void
    {
        $user = User::factory()->create();

        $employee = Employee::create([
            'name' => 'Charlie Smith',
            'department' => 'Operations',
        ]);

        $device = Device::create([
            'asset_tag' => 'SM-LAP-101',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad T14',
            'device_type' => 'laptop',
            'cpu' => 'AMD Ryzen 5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2022,
            'condition' => 'good',
            'status' => 'assigned',
            'lifecycle_stage' => 'deployment',
        ]);

        Assignment::create([
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'assigned_at' => now()->subMonths(3),
            'assignment_source' => 'manual_override',
        ]);

        $this->actingAs($user);

        $response = $this->postJson(route('employees.offboard', $employee->id), [
            'reason' => 'hardware_upgrade',
            'condition' => 'needs_repair',
            'wipe_confirmed' => true,
            'notes' => 'Damaged hinge requiring replacement.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('device.lifecycle_stage', 'maintenance');
        $response->assertJsonPath('device.status', 'in_repair');
    }

    public function test_matching_service_produces_explainable_subscore_audit_and_procurement_avoidance(): void
    {
        $matchingService = app(MatchingService::class);

        $device = Device::create([
            'asset_tag' => 'SM-AUDIT-01',
            'brand' => 'Dell',
            'model' => 'Precision 5570',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i7-12800H',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu' => 'NVIDIA RTX A2000',
            'gpu_tier' => 'dedicated-entry',
            'year_acquired' => 2023,
            'condition' => 'excellent',
            'status' => 'available',
            'lifecycle_stage' => 'reclaimed',
            'purchase_cost' => 120000.00,
            'warranty_expiry' => now()->addYear(),
        ]);

        $requirements = [
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 512,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-entry',
            'portability_required' => true,
        ];

        $eval = $matchingService->evaluateDevice($device, $requirements, true);

        // Subscore Audit checks
        $this->assertArrayHasKey('subscore_audit', $eval);
        $this->assertEquals(0.30, $eval['subscore_audit']['cpu']['weight']);
        $this->assertEquals('Met', $eval['subscore_audit']['cpu']['status']);
        $this->assertEquals('Met', $eval['subscore_audit']['ram']['status']);
        $this->assertEquals('Headroom', $eval['subscore_audit']['storage']['status']);

        // CapEx Avoidance audit checks
        $this->assertArrayHasKey('procurement_avoidance_audit', $eval);
        $this->assertEquals(120000.00, $eval['procurement_avoidance_audit']['avoided_capex_php']);
        $this->assertStringContainsString('Benchmark Replacement', $eval['procurement_avoidance_audit']['formula']);

        // Confidence Rating checks
        $this->assertArrayHasKey('confidence_score', $eval);
        $this->assertGreaterThanOrEqual(80, $eval['confidence_score']);
        $this->assertEquals('High Confidence', $eval['confidence_level']);
    }

    public function test_rank_devices_generates_why_not_reasons_for_subsequent_candidates(): void
    {
        $matchingService = app(MatchingService::class);

        // Top candidate: 32GB RAM, Dedicated GPU
        Device::create([
            'asset_tag' => 'SM-TOP-01',
            'brand' => 'Dell',
            'model' => 'Precision',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i9',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu' => 'NVIDIA RTX',
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        // Alternative candidate: 16GB RAM, Integrated GPU
        Device::create([
            'asset_tag' => 'SM-ALT-02',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i7',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2021,
            'condition' => 'fair',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        $requirements = [
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 512,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-entry',
            'portability_required' => true,
        ];

        $ranked = $matchingService->rankDevices($requirements, null, true);

        $this->assertNotEmpty($ranked['alternative_comparisons']);
        $alt = $ranked['alternative_comparisons'][0];

        $this->assertEquals('SM-ALT-02', $alt['asset_tag']);
        $this->assertNotEmpty($alt['why_not_reasons']);
        $this->assertStringContainsString('less RAM', implode(' ', $alt['why_not_reasons']));
    }

    public function test_what_if_headcount_simulation_endpoint(): void
    {
        $user = User::factory()->create();

        // Create 2 idle laptops
        Device::create([
            'asset_tag' => 'SM-SIM-01',
            'brand' => 'Dell',
            'model' => 'Latitude 5420',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i7',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
            'lifecycle_stage' => 'reclaimed',
            'purchase_cost' => 65000.00,
        ]);

        Device::create([
            'asset_tag' => 'SM-SIM-02',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad E14',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
            'lifecycle_stage' => 'reclaimed',
            'purchase_cost' => 65000.00,
        ]);

        $this->actingAs($user);

        // Simulate hiring 3 mid-level engineers (2 covered, 1 deficit)
        $response = $this->postJson(route('match.simulate'), [
            'requirements' => [
                'min_cpu_tier' => 'mid',
                'min_ram_gb' => 16,
                'min_storage_gb' => 512,
                'requires_gpu' => false,
                'min_gpu_tier' => 'none',
                'portability_required' => true,
            ],
            'quantity' => 3,
        ]);

        $response->assertOk();
        $response->assertJsonPath('quantity_requested', 3);
        $response->assertJsonPath('covered_count', 2);
        $response->assertJsonPath('deficit_count', 1);
        $response->assertJsonPath('coverage_percentage', 66.7);
        $response->assertJsonPath('procurement_needed', true);
        $this->assertEquals(130000.00, $response->json('capex_avoided_php'));
        $this->assertEquals(65000.00, $response->json('capex_required_php'));
    }

    public function test_itam_fleet_operational_risk_score_calculation(): void
    {
        $itamService = app(ItamTrackingService::class);

        // Create healthy device
        Device::create([
            'asset_tag' => 'SM-HEALTHY-01',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 14',
            'device_type' => 'laptop',
            'cpu' => 'M2 Pro',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'assigned',
            'lifecycle_stage' => 'deployment',
            'warranty_expiry' => now()->addYear(),
        ]);

        // Create aging, expired warranty device
        Device::create([
            'asset_tag' => 'SM-RISK-02',
            'brand' => 'HP',
            'model' => 'ProBook 450',
            'device_type' => 'laptop',
            'cpu' => 'Intel Core i5',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_type' => 'HDD',
            'storage_gb' => 500,
            'gpu_tier' => 'none',
            'year_acquired' => 2019,
            'condition' => 'fair',
            'status' => 'assigned',
            'lifecycle_stage' => 'deployment',
            'warranty_expiry' => now()->subMonths(10),
        ]);

        $risk = $itamService->getFleetRiskScore();

        $this->assertArrayHasKey('risk_score', $risk);
        $this->assertArrayHasKey('risk_tier', $risk);
        $this->assertArrayHasKey('factors', $risk);
        $this->assertEquals(2, $risk['counts']['total_active']);
        $this->assertGreaterThan(0, $risk['risk_score']);
        $this->assertNotEmpty($risk['key_alerts']);
    }
}
