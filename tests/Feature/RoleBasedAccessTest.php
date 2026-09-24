<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleBasedAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_access_device_creation(): void
    {
        $admin = User::factory()->admin()->create();

        $response = $this->actingAs($admin)->get('/devices/create');

        $response->assertOk();
    }

    public function test_manager_can_access_device_creation(): void
    {
        $manager = User::factory()->manager()->create();

        $response = $this->actingAs($manager)->get('/devices/create');

        $response->assertOk();
    }

    public function test_viewer_cannot_access_device_creation(): void
    {
        $viewer = User::factory()->viewer()->create();

        $response = $this->actingAs($viewer)->get('/devices/create');

        $response->assertForbidden();
    }

    public function test_technician_cannot_create_devices(): void
    {
        $tech = User::factory()->technician()->create();

        $response = $this->actingAs($tech)->post('/devices', [
            'asset_tag' => 'TEST-001',
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
            'status' => 'available',
        ]);

        $response->assertForbidden();
    }

    public function test_technician_can_create_maintenance_logs(): void
    {
        $tech = User::factory()->technician()->create();
        $device = Device::create([
            'asset_tag' => 'MAINT-001',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test Model',
            'cpu' => 'Test CPU',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'good',
            'status' => 'available',
        ]);

        $response = $this->actingAs($tech)->post("/devices/{$device->id}/maintenance", [
            'type' => 'repair',
            'title' => 'Screen replacement',
            'description' => 'Cracked screen needs replacement',
            'cost' => 5000,
            'started_at' => now()->toDateString(),
            'status' => 'in_progress',
        ]);

        $response->assertRedirect();
    }

    public function test_viewer_cannot_create_maintenance_logs(): void
    {
        $viewer = User::factory()->viewer()->create();
        $device = Device::create([
            'asset_tag' => 'MAINT-002',
            'device_type' => 'laptop',
            'brand' => 'Test',
            'model' => 'Test Model',
            'cpu' => 'Test CPU',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'none',
            'year_acquired' => 2024,
            'condition' => 'good',
            'status' => 'available',
        ]);

        $response = $this->actingAs($viewer)->post("/devices/{$device->id}/maintenance", [
            'type' => 'repair',
            'title' => 'Screen replacement',
            'description' => 'Cracked screen needs replacement',
            'cost' => 5000,
            'started_at' => now()->toDateString(),
            'status' => 'in_progress',
        ]);

        $response->assertForbidden();
    }

    public function test_viewer_can_view_devices_list(): void
    {
        $viewer = User::factory()->viewer()->create();

        $response = $this->actingAs($viewer)->get('/devices');

        $response->assertOk();
    }

    public function test_viewer_can_view_dashboard(): void
    {
        $viewer = User::factory()->viewer()->create();

        $response = $this->actingAs($viewer)->get('/dashboard');

        $response->assertOk();
    }

    public function test_unauthenticated_user_cannot_access_any_route(): void
    {
        $response = $this->get('/devices');

        $response->assertRedirect('/login');
    }
}
