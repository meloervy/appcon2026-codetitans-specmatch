<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DeviceManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_list_devices_with_filters(): void
    {
        Device::create([
            'asset_tag' => 'LAP-100',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Air',
            'cpu' => 'M2',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        Device::create([
            'asset_tag' => 'DSK-100',
            'device_type' => 'desktop',
            'brand' => 'Dell',
            'model' => 'OptiPlex',
            'cpu' => 'i3',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_type' => 'HDD',
            'storage_gb' => 1000,
            'gpu_tier' => 'none',
            'year_acquired' => 2021,
            'condition' => 'fair',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->user)->get('/devices?device_type=laptop');
        $response->assertOk();
    }

    public function test_can_register_new_device(): void
    {
        $response = $this->actingAs($this->user)->post('/devices', [
            'asset_tag' => 'NEW-001',
            'device_type' => 'laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad P16',
            'cpu' => 'Intel Core i9-14900HX',
            'cpu_tier' => 'workstation',
            'ram_gb' => 64,
            'storage_type' => 'SSD',
            'storage_gb' => 2048,
            'gpu' => 'NVIDIA RTX 3500 Ada',
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
            'notes' => 'Newly delivered workstation unit.',
        ]);

        $response->assertRedirect('/devices');
        $this->assertDatabaseHas('devices', ['asset_tag' => 'NEW-001']);
    }

    public function test_can_retire_device(): void
    {
        $device = Device::create([
            'asset_tag' => 'RET-001',
            'device_type' => 'desktop',
            'brand' => 'HP',
            'model' => 'Compaq',
            'cpu' => 'Intel Core 2 Duo',
            'cpu_tier' => 'entry',
            'ram_gb' => 4,
            'storage_type' => 'HDD',
            'storage_gb' => 250,
            'gpu_tier' => 'none',
            'year_acquired' => 2012,
            'condition' => 'fair',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->user)->post("/devices/{$device->id}/retire");
        $response->assertRedirect();
        $this->assertEquals('retired', $device->fresh()->status);
        $this->assertEquals('retired', $device->fresh()->condition);
    }
}
