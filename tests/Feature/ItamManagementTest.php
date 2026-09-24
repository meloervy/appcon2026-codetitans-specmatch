<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\MaintenanceLog;
use App\Models\User;
use App\Services\ItamTrackingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ItamManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_register_device_with_full_itam_attributes(): void
    {
        $response = $this->actingAs($this->user)->post('/devices', [
            'asset_tag' => 'LAP-ITAM-01',
            'serial_number' => 'SN-12345678',
            'barcode' => 'BAR-998877',
            'techspecs_id' => 'apple-macbook-pro-16',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16',
            'location' => 'HQ - Level 3 Room 302',
            'cpu' => 'Apple M3 Pro',
            'cpu_tier' => 'high',
            'ram_gb' => 36,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu' => 'Apple 18-core GPU',
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'purchase_cost' => 2899.00,
            'purchase_date' => '2024-03-01',
            'depreciation_rate_percent' => 20.0,
            'vendor' => 'Apple Direct',
            'warranty_start' => '2024-03-01',
            'warranty_expiry' => '2027-03-01',
            'contract_sla' => 'AppleCare+ 3-Year Enterprise',
            'condition' => 'excellent',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        $response->assertRedirect('/devices');
        $this->assertDatabaseHas('devices', [
            'asset_tag' => 'LAP-ITAM-01',
            'serial_number' => 'SN-12345678',
            'vendor' => 'Apple Direct',
            'location' => 'HQ - Level 3 Room 302',
            'lifecycle_stage' => 'deployment',
        ]);
        $this->assertDatabaseHas('lifecycle_events', [
            'to_stage' => 'deployment',
        ]);
    }

    public function test_can_transition_asset_lifecycle_stage(): void
    {
        $device = Device::create([
            'asset_tag' => 'LAP-STAGE-01',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'Latitude 5540',
            'cpu' => 'Intel Core i7-1365U',
            'cpu_tier' => 'high',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'good',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        $response = $this->actingAs($this->user)->post("/devices/{$device->id}/lifecycle", [
            'to_stage' => 'maintenance',
            'notes' => 'Sent to hardware lab for diagnostic inspection.',
        ]);

        $response->assertRedirect();
        $device->refresh();
        $this->assertEquals('maintenance', $device->lifecycle_stage);
        $this->assertEquals('in_repair', $device->status);

        $this->assertDatabaseHas('lifecycle_events', [
            'device_id' => $device->id,
            'from_stage' => 'deployment',
            'to_stage' => 'maintenance',
            'notes' => 'Sent to hardware lab for diagnostic inspection.',
        ]);
    }

    public function test_can_log_and_update_maintenance_activity(): void
    {
        $device = Device::create([
            'asset_tag' => 'LAP-MAINT-01',
            'device_type' => 'laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad T14',
            'cpu' => 'AMD Ryzen 5 PRO',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        // 1. Log maintenance
        $response = $this->actingAs($this->user)->post("/devices/{$device->id}/maintenance", [
            'type' => 'repair',
            'title' => 'Keyboard Key Replacement',
            'description' => 'Replace broken Enter keycap and lubricate mechanism.',
            'cost' => 45.00,
            'performed_by' => 'Internal IT Desk',
            'started_at' => now()->toDateString(),
            'status' => 'in_progress',
            'send_to_maintenance_stage' => true,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('maintenance_logs', [
            'device_id' => $device->id,
            'title' => 'Keyboard Key Replacement',
            'cost' => 45.00,
            'status' => 'in_progress',
        ]);

        $device->refresh();
        $this->assertEquals('maintenance', $device->lifecycle_stage);
        $this->assertEquals('in_repair', $device->status);

        $log = MaintenanceLog::where('device_id', $device->id)->first();

        // 2. Complete maintenance with performance assessment
        $updateResponse = $this->actingAs($this->user)->put("/maintenance/{$log->id}", [
            'cost' => 45.00,
            'completed_at' => now()->toDateString(),
            'performance_assessment' => 'Keycap replaced, keystroke latency normal, all diagnostics passed.',
            'status' => 'completed',
            'restore_to_available' => true,
        ]);

        $updateResponse->assertRedirect();
        $log->refresh();
        $device->refresh();

        $this->assertEquals('completed', $log->status);
        $this->assertEquals('Keycap replaced, keystroke latency normal, all diagnostics passed.', $log->performance_assessment);
        $this->assertEquals('deployment', $device->lifecycle_stage);
        $this->assertEquals('available', $device->status);
    }

    public function test_itam_tracking_service_financials_and_depreciation(): void
    {
        Device::create([
            'asset_tag' => 'LAP-DEP-01',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'XPS 15',
            'cpu' => 'Intel Core i7',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu_tier' => 'dedicated-entry',
            'year_acquired' => 2022,
            'purchase_cost' => 2000.00,
            'purchase_date' => now()->subYears(2)->toDateString(),
            'depreciation_rate_percent' => 20.0,
            'warranty_expiry' => now()->addDays(20)->toDateString(),
            'condition' => 'good',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        $service = new ItamTrackingService;
        $financials = $service->getFinancialSummary();
        $warranties = $service->getWarrantyAlerts();
        $redundancy = $service->detectRedundantAssets();

        $this->assertGreaterThan(0, $financials['total_acquisition_cost']);
        $this->assertGreaterThan(0, $financials['current_book_value']);
        $this->assertEquals(1, $warranties['expiring_soon_count']);
        $this->assertEquals(1, $redundancy['idle_high_spec_count']);
    }

    public function test_maintenance_index_view_is_accessible(): void
    {
        $response = $this->actingAs($this->user)->get('/maintenance');
        $response->assertOk();
    }
}
