<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DevicePdfExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_export_devices_pdf(): void
    {
        $response = $this->get('/devices/export/pdf');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_export_devices_pdf(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        Device::create([
            'asset_tag' => 'TEST-001',
            'serial_number' => 'SN-TEST-001',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16',
            'device_type' => 'laptop',
            'location' => 'BGC, Taguig City',
            'cpu' => 'Apple M3 Pro',
            'cpu_tier' => 'high',
            'ram_gb' => 36,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'year_acquired' => 2024,
            'purchase_cost' => 150000.00,
            'purchase_date' => '2024-01-01',
            'depreciation_rate_percent' => 20.0,
            'status' => 'available',
            'condition' => 'excellent',
            'lifecycle_stage' => 'deployment',
        ]);

        $response = $this->actingAs($user)->get('/devices/export/pdf');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/pdf');
        $this->assertStringContainsString('specmatch-itam-inventory-', $response->headers->get('content-disposition'));
    }
}
