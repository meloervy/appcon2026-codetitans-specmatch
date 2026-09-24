<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\RoleProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceControllerGuardsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->admin = User::factory()->admin()->create();
    }

    public function test_cannot_delete_assigned_device(): void
    {
        $device = Device::create([
            'asset_tag' => 'DEL-001',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test CPU',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'assigned',
        ]);

        $profile = RoleProfile::create([
            'name' => 'Test Profile',
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 8,
            'min_storage_gb' => 256,
            'requires_gpu' => false,
            'portability_required' => false,
        ]);

        $employee = Employee::create([
            'name' => 'Test Employee',
            'department' => 'Test',
            'role_profile_id' => $profile->id,
        ]);

        Assignment::create([
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'assigned_at' => now(),
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($this->admin)->delete("/devices/{$device->id}");

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('devices', ['id' => $device->id]);
    }

    public function test_can_delete_unassigned_device(): void
    {
        $device = Device::create([
            'asset_tag' => 'DEL-002',
            'device_type' => 'desktop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test CPU',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_type' => 'HDD',
            'storage_gb' => 500,
            'gpu_tier' => 'none',
            'year_acquired' => 2020,
            'condition' => 'fair',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->admin)->delete("/devices/{$device->id}");

        $response->assertRedirect(route('devices.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('devices', ['id' => $device->id]);
    }

    public function test_store_rejects_duplicate_asset_tag(): void
    {
        Device::create([
            'asset_tag' => 'DUP-001',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->admin)->post('/devices', [
            'asset_tag' => 'DUP-001',
            'device_type' => 'laptop',
            'brand' => 'Another',
            'model' => 'Another',
            'cpu' => 'Another',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $response->assertSessionHasErrors('asset_tag');
    }

    public function test_store_rejects_duplicate_serial_number(): void
    {
        Device::create([
            'asset_tag' => 'SN-001',
            'serial_number' => 'UNIQUE-SN-123',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->admin)->post('/devices', [
            'asset_tag' => 'SN-002',
            'serial_number' => 'UNIQUE-SN-123',
            'device_type' => 'laptop',
            'brand' => 'Another',
            'model' => 'Another',
            'cpu' => 'Another',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $response->assertSessionHasErrors('serial_number');
    }

    public function test_scope_available_excludes_needs_repair_and_retired(): void
    {
        Device::create([
            'asset_tag' => 'SCOPE-001',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'needs_repair',
            'status' => 'available',
        ]);

        Device::create([
            'asset_tag' => 'SCOPE-002',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        Device::create([
            'asset_tag' => 'SCOPE-003',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'retired',
            'status' => 'available',
        ]);

        $available = Device::available()->get();

        $this->assertCount(1, $available);
        $this->assertEquals('SCOPE-002', $available->first()->asset_tag);
    }

    public function test_store_rejects_warranty_expiry_before_start(): void
    {
        $response = $this->actingAs($this->admin)->post('/devices', [
            'asset_tag' => 'WRN-001',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test',
            'cpu' => 'Test',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
            'warranty_start' => '2024-05-01',
            'warranty_expiry' => '2024-04-01', // before start!
        ]);

        $response->assertSessionHasErrors('warranty_expiry');
    }
}
