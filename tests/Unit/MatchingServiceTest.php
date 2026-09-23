<?php

namespace Tests\Unit;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\RoleProfile;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchingServiceTest extends TestCase
{
    use RefreshDatabase;

    private MatchingService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new MatchingService();
    }

    public function test_device_with_no_gpu_is_disqualified_when_gpu_is_required(): void
    {
        $device = Device::create([
            'asset_tag' => 'TEST-001',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'Inspiron',
            'cpu' => 'Intel Core i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu' => null,
            'gpu_tier' => 'none',
            'year_acquired' => 2023,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $eval = $this->service->evaluateDevice($device, [
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-entry',
            'portability_required' => true,
        ]);

        $this->assertTrue($eval['disqualified']);
        $this->assertFalse($eval['passes_threshold']);
        $this->assertStringContainsString('Workload requires dedicated or integrated GPU', $eval['disqualification_reason']);
    }

    public function test_perfect_match_scores_high(): void
    {
        $device = Device::create([
            'asset_tag' => 'TEST-002',
            'device_type' => 'laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad',
            'cpu' => 'AMD Ryzen 7',
            'cpu_tier' => 'high',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu' => 'AMD Radeon 780M',
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $eval = $this->service->evaluateDevice($device, [
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
        ]);

        $this->assertFalse($eval['disqualified']);
        $this->assertGreaterThanOrEqual(0.90, $eval['score']);
        $this->assertTrue($eval['passes_threshold']);
    }

    public function test_procurement_recommended_when_all_devices_sub_threshold(): void
    {
        // Only one low-spec device available
        Device::create([
            'asset_tag' => 'LOW-001',
            'device_type' => 'desktop',
            'brand' => 'Acer',
            'model' => 'Veriton',
            'cpu' => 'Celeron',
            'cpu_tier' => 'entry',
            'ram_gb' => 4,
            'storage_type' => 'HDD',
            'storage_gb' => 128,
            'gpu' => null,
            'gpu_tier' => 'none',
            'year_acquired' => 2018,
            'condition' => 'fair',
            'status' => 'available',
        ]);

        // Demanding workstation workload
        $result = $this->service->rankDevices([
            'min_cpu_tier' => 'workstation',
            'min_ram_gb' => 64,
            'min_storage_gb' => 2048,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-high',
            'portability_required' => true,
        ]);

        $this->assertTrue($result['procurement_recommended']);
    }

    public function test_assign_device_enforces_single_active_assignment_invariant(): void
    {
        $device1 = Device::create([
            'asset_tag' => 'DEV-A',
            'device_type' => 'laptop',
            'brand' => 'HP',
            'model' => 'EliteBook',
            'cpu' => 'Intel i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $device2 = Device::create([
            'asset_tag' => 'DEV-B',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'Latitude',
            'cpu' => 'Intel i7',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $employee = Employee::create([
            'name' => 'John Doe',
            'department' => 'IT',
        ]);

        // First assignment
        $asg1 = $this->service->assignDevice($device1->id, $employee->id, 'manual_override', 0.88);
        $this->assertEquals('assigned', $device1->fresh()->status);
        $this->assertNull($asg1->fresh()->unassigned_at);

        // Assign second device to same employee
        $asg2 = $this->service->assignDevice($device2->id, $employee->id, 'ai_recommended', 0.95);

        // Verify first assignment was automatically unassigned
        $this->assertNotNull($asg1->fresh()->unassigned_at);
        $this->assertNull($asg2->fresh()->unassigned_at);

        // Verify only 1 active assignment exists for this employee
        $activeCount = Assignment::where('employee_id', $employee->id)
            ->whereNull('unassigned_at')
            ->count();
        $this->assertEquals(1, $activeCount);
    }
}
