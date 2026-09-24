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

    public function test_guest_cannot_access_identify_specs_endpoint(): void
    {
        $response = $this->postJson('/devices/identify-specs', [
            'query' => 'ThinkPad T14',
        ]);

        $response->assertUnauthorized();
    }

    public function test_identify_specs_validates_query_length(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'a',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['query']);
    }

    public function test_authenticated_user_can_identify_specs_for_hardware(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'MacBook Pro 16 M3 Max 64GB',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'specs' => [
                    'brand',
                    'model',
                    'device_type',
                    'cpu',
                    'cpu_tier',
                    'ram_gb',
                    'storage_type',
                    'storage_gb',
                    'gpu',
                    'gpu_tier',
                    'year_acquired',
                ],
                'source',
                'error',
            ])
            ->assertJson([
                'success' => true,
            ]);

        $this->assertEquals('Apple', $response->json('specs.brand'));
    }

    public function test_identify_specs_uses_cache_on_subsequent_request(): void
    {
        $query = 'Dell XPS 15 Intel i7 32GB SSD';

        $first = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => $query,
        ]);
        $first->assertOk();

        // Second call should return cache source
        $second = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => $query,
        ]);
        $second->assertOk();
        $this->assertEquals('cache', $second->json('source'));
    }

    public function test_identify_specs_correctly_autofills_macbook_m5_hardware_specifications(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'MacBook m5',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'specs' => [
                    'brand' => 'Apple',
                    'model' => 'MacBook m5',
                    'device_type' => 'laptop',
                    'cpu' => 'Apple M5',
                    'cpu_tier' => 'high',
                    'ram_gb' => 16,
                    'storage_type' => 'SSD',
                    'storage_gb' => 512,
                    'gpu' => 'Apple 10-core GPU',
                    'gpu_tier' => 'integrated',
                    'image_url' => '/images/devices/apple-macbook-pro.jpg',
                ],
            ]);

        $this->assertEquals('Apple M5', $response->json('specs.cpu'));
        $this->assertEquals('/images/devices/apple-macbook-pro.jpg', $response->json('specs.image_url'));
    }

    public function test_identify_specs_correctly_identifies_intel_and_curated_public_asset(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'ThinkPad T14 Gen 4 Intel Core i7 32GB',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'specs' => [
                    'brand' => 'Lenovo',
                    'cpu' => 'Intel Core i7-13700H',
                    'cpu_tier' => 'high',
                    'ram_gb' => 32,
                    'image_url' => '/images/devices/lenovo-thinkpad.jpg',
                ],
            ]);
    }

    public function test_identify_specs_correctly_identifies_snapdragon_x_elite_copilot_laptop(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'Surface Laptop 7 Snapdragon X Elite 32GB',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'specs' => [
                    'brand' => 'Microsoft',
                    'device_type' => 'laptop',
                    'cpu' => 'Qualcomm Snapdragon X Elite X1E-80-100',
                    'cpu_tier' => 'high',
                    'ram_gb' => 32,
                    'gpu' => 'Qualcomm Adreno X1-85 GPU',
                    'gpu_tier' => 'integrated',
                ],
            ]);
    }

    public function test_identify_specs_correctly_identifies_chromebook_specifications(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'Acer Chromebook Spin 714 Intel N100 8GB',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'specs' => [
                    'brand' => 'Acer',
                    'device_type' => 'laptop',
                    'cpu' => 'Intel Processor N100',
                    'cpu_tier' => 'entry',
                    'ram_gb' => 8,
                    'image_url' => '/images/devices/acer-aspire.jpg',
                ],
            ]);
    }

    public function test_identify_specs_correctly_identifies_mini_pc_and_desktop_form_factor(): void
    {
        $response = $this->actingAs($this->user)->postJson('/devices/identify-specs', [
            'query' => 'Apple Mac mini M4 16GB',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'specs' => [
                    'brand' => 'Apple',
                    'device_type' => 'desktop',
                    'cpu' => 'Apple M4',
                    'cpu_tier' => 'high',
                    'ram_gb' => 16,
                    'image_url' => '/images/devices/default-desktop.jpg',
                ],
            ]);
    }
}
