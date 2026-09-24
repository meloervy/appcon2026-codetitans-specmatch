<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\MaintenanceLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MaintenanceIndexTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_can_filter_and_search_maintenance_logs(): void
    {
        $device = Device::create([
            'asset_tag' => 'LAP-SRCH-01',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Pro',
            'cpu' => 'M2 Pro',
            'cpu_tier' => 'high',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'dedicated-entry',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
        ]);

        MaintenanceLog::create([
            'device_id' => $device->id,
            'type' => 'repair',
            'title' => 'Screen Replacement for Retina Display',
            'description' => 'Fixing cracked screen',
            'cost' => 4500.00,
            'performed_by' => 'Apple Center Technician',
            'started_at' => now()->subDays(3),
            'status' => 'completed',
        ]);

        MaintenanceLog::create([
            'device_id' => $device->id,
            'type' => 'upgrade',
            'title' => 'RAM Expansion to 32GB',
            'description' => 'Upgrading memory',
            'cost' => 3000.00,
            'performed_by' => 'Internal IT Desk',
            'started_at' => now()->subDays(1),
            'status' => 'in_progress',
        ]);

        // Search by title keyword
        $responseSearch = $this->actingAs($this->user)->get('/maintenance?search=Retina');
        $responseSearch->assertOk();
        $responseSearch->assertInertia(fn (Assert $page) => $page
            ->component('Maintenance/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.title', 'Screen Replacement for Retina Display')
        );

        // Filter by type
        $responseType = $this->actingAs($this->user)->get('/maintenance?type=upgrade');
        $responseType->assertOk();
        $responseType->assertInertia(fn (Assert $page) => $page
            ->component('Maintenance/Index')
            ->has('logs.data', 1)
            ->where('logs.data.0.type', 'upgrade')
        );
    }

    public function test_can_sort_maintenance_logs_by_cost_and_timeline(): void
    {
        $device = Device::create([
            'asset_tag' => 'LAP-SORT-01',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'Latitude 5540',
            'cpu' => 'Intel Core i7',
            'cpu_tier' => 'high',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'good',
            'status' => 'available',
        ]);

        $logLowCost = MaintenanceLog::create([
            'device_id' => $device->id,
            'type' => 'preventive',
            'title' => 'Thermal Paste & Dust Cleaning',
            'description' => 'Regular cleaning',
            'cost' => 500.00,
            'performed_by' => 'Internal IT Desk',
            'started_at' => now()->subDays(5),
            'status' => 'completed',
        ]);

        $logHighCost = MaintenanceLog::create([
            'device_id' => $device->id,
            'type' => 'repair',
            'title' => 'Motherboard Replacement',
            'description' => 'Chipset repair',
            'cost' => 12000.00,
            'performed_by' => 'Dell Official Service',
            'started_at' => now()->subDays(2),
            'status' => 'completed',
        ]);

        // Sort by cost ascending
        $responseCostAsc = $this->actingAs($this->user)->get('/maintenance?sort=cost&direction=asc');
        $responseCostAsc->assertOk();
        $responseCostAsc->assertInertia(fn (Assert $page) => $page
            ->component('Maintenance/Index')
            ->has('logs.data', 2)
            ->where('logs.data.0.id', $logLowCost->id)
            ->where('logs.data.1.id', $logHighCost->id)
        );

        // Sort by cost descending
        $responseCostDesc = $this->actingAs($this->user)->get('/maintenance?sort=cost&direction=desc');
        $responseCostDesc->assertOk();
        $responseCostDesc->assertInertia(fn (Assert $page) => $page
            ->component('Maintenance/Index')
            ->has('logs.data', 2)
            ->where('logs.data.0.id', $logHighCost->id)
            ->where('logs.data.1.id', $logLowCost->id)
        );
    }
}
