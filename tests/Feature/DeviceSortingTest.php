<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DeviceSortingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_sort_devices_chronologically(): void
    {
        $deviceOlder = Device::create([
            'asset_tag' => 'LAP-OLD-01',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'Latitude 5400',
            'cpu' => 'Intel Core i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2021,
            'condition' => 'good',
            'status' => 'available',
        ]);
        $deviceOlder->forceFill(['created_at' => now()->subDays(10)])->save();

        $deviceNewer = Device::create([
            'asset_tag' => 'LAP-NEW-02',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16',
            'cpu' => 'M3 Max',
            'cpu_tier' => 'high',
            'ram_gb' => 36,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);
        $deviceNewer->forceFill(['created_at' => now()->subDays(1)])->save();

        // Chronological descending (newest first)
        $responseDesc = $this->actingAs($this->user)->get('/devices?sort=created_at&direction=desc');
        $responseDesc->assertOk();
        $responseDesc->assertInertia(fn (Assert $page) => $page
            ->component('Devices/Index')
            ->has('devices.data', 2)
            ->where('devices.data.0.asset_tag', 'LAP-NEW-02')
            ->where('devices.data.1.asset_tag', 'LAP-OLD-01')
        );

        // Chronological ascending (oldest first)
        $responseAsc = $this->actingAs($this->user)->get('/devices?sort=created_at&direction=asc');
        $responseAsc->assertOk();
        $responseAsc->assertInertia(fn (Assert $page) => $page
            ->component('Devices/Index')
            ->has('devices.data', 2)
            ->where('devices.data.0.asset_tag', 'LAP-OLD-01')
            ->where('devices.data.1.asset_tag', 'LAP-NEW-02')
        );
    }

    public function test_can_sort_devices_by_specifications(): void
    {
        Device::create([
            'asset_tag' => 'DSK-8GB',
            'device_type' => 'desktop',
            'brand' => 'HP',
            'model' => 'ProDesk',
            'cpu' => 'Intel Core i3',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_type' => 'SSD',
            'storage_gb' => 256,
            'gpu_tier' => 'none',
            'year_acquired' => 2022,
            'condition' => 'good',
            'status' => 'available',
        ]);

        Device::create([
            'asset_tag' => 'DSK-64GB',
            'device_type' => 'desktop',
            'brand' => 'Dell',
            'model' => 'Precision',
            'cpu' => 'Intel Xeon',
            'cpu_tier' => 'workstation',
            'ram_gb' => 64,
            'storage_type' => 'SSD',
            'storage_gb' => 2048,
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->user)->get('/devices?sort=specs&direction=desc');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Devices/Index')
            ->where('devices.data.0.asset_tag', 'DSK-64GB')
            ->where('devices.data.1.asset_tag', 'DSK-8GB')
        );
    }
}
