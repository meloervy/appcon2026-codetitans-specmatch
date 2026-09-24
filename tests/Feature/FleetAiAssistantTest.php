<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\MaintenanceLog;
use App\Models\RoleProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FleetAiAssistantTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create([
            'role' => 'admin',
        ]);
    }

    private function createDevice(array $attributes = []): Device
    {
        static $counter = 1;
        $defaults = [
            'asset_tag' => 'DEV-'.str_pad((string) $counter++, 3, '0', STR_PAD_LEFT),
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'Latitude 5440',
            'location' => 'BGC, Taguig City',
            'cpu' => 'Intel Core i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_gb' => 512,
            'storage_type' => 'SSD',
            'gpu' => 'Intel Iris Xe',
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'good',
            'status' => 'available',
            'purchase_cost' => 55000.00,
        ];

        return Device::create(array_merge($defaults, $attributes));
    }

    public function test_unauthenticated_user_cannot_query_fleet_assistant(): void
    {
        $response = $this->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Do we have any available laptops?',
        ]);

        $response->assertUnauthorized();
    }

    public function test_context_endpoint_returns_metrics_and_starter_followups(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-001',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16 M3 Max',
            'ram_gb' => 36,
            'storage_gb' => 1024,
            'purchase_cost' => 185000.00,
        ]);

        $response = $this->actingAs($this->user)->getJson(route('fleet-assistant.context'));

        $response->assertOk()
            ->assertJsonStructure([
                'metrics' => [
                    'total_devices',
                    'available_count',
                    'assigned_count',
                    'current_book_value',
                ],
                'starter_followups',
                'ai_status' => [
                    'state',
                    'model',
                    'label',
                    'is_fallback',
                ],
            ]);
    }

    public function test_inventory_availability_query_returns_available_devices_data_cards(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-001',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16 M3 Max',
            'location' => 'BGC, Taguig City',
            'cpu' => 'Apple M3 Max',
            'cpu_tier' => 'high',
            'ram_gb' => 36,
            'storage_gb' => 1024,
            'status' => 'available',
            'purchase_cost' => 185000.00,
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Do we have any available 32GB laptops in BGC?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'inventory_availability',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['data_cards']);
        $this->assertEquals('device', $data['data_cards'][0]['type']);
        $this->assertEquals('LAP-001', $data['data_cards'][0]['asset_tag']);
        $this->assertStringContainsString('LAP-001', $data['answer']);
        $this->assertNotEmpty($data['suggested_followups']);
    }

    public function test_warranty_query_returns_expiring_warranties_cards(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-002',
            'location' => 'Ortigas, Pasig City',
            'vendor' => 'Dell Philippines',
            'warranty_start' => Carbon::now()->subYears(2),
            'warranty_expiry' => Carbon::now()->addDays(20), // Expiring soon (< 60 days)
            'status' => 'assigned',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Which hardware warranties expire in the next 45 days?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'warranty_lifecycle',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['data_cards']);
        $this->assertEquals('LAP-002', $data['data_cards'][0]['asset_tag']);
        $this->assertStringContainsString('expiring', strtolower($data['answer']));
    }

    public function test_mismatch_query_returns_underprovisioned_data_cards(): void
    {
        $profile = RoleProfile::create([
            'name' => 'Lead AI Engineer',
            'department' => 'Technology',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
            'requires_gpu' => true,
            'portability_required' => false,
        ]);

        $employee = Employee::create([
            'name' => 'Danilo Ramos',
            'department' => 'Technology',
            'role_profile_id' => $profile->id,
        ]);

        $underDevice = $this->createDevice([
            'asset_tag' => 'LAP-009',
            'brand' => 'Lenovo',
            'model' => 'IdeaPad 3',
            'cpu' => 'Intel Core i3',
            'cpu_tier' => 'entry', // Bottleneck!
            'ram_gb' => 8,         // Bottleneck!
            'storage_gb' => 256,
            'status' => 'assigned',
            'purchase_cost' => 28000.00,
        ]);

        Assignment::create([
            'device_id' => $underDevice->id,
            'employee_id' => $employee->id,
            'assigned_at' => Carbon::now()->subMonths(3),
            'match_score' => 0.25,
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Who in the company is using an under-provisioned computer?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'fleet_mismatches',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['data_cards']);
        $this->assertEquals('mismatch', $data['data_cards'][0]['type']);
        $this->assertStringContainsString('Danilo Ramos', $data['data_cards'][0]['name']);
    }

    public function test_financial_query_returns_valuation_and_depreciation(): void
    {
        $this->createDevice([
            'asset_tag' => 'DSK-001',
            'device_type' => 'desktop',
            'model' => 'OptiPlex 7000',
            'location' => 'Makati City',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'purchase_cost' => 80000.00,
            'purchase_date' => Carbon::now()->subYear(),
            'depreciation_rate_percent' => 20.0,
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'What is our total fleet acquisition cost and current book value?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'financials',
            ]);

        $data = $response->json();
        $this->assertStringContainsString('Acquisition', $data['answer']);
        $this->assertStringContainsString('Book Value', $data['answer']);
    }

    public function test_maintenance_query_returns_active_repairs(): void
    {
        $device = $this->createDevice([
            'asset_tag' => 'LAP-003',
            'brand' => 'HP',
            'model' => 'EliteBook 840 G10',
            'status' => 'in_repair',
            'purchase_cost' => 75000.00,
        ]);

        MaintenanceLog::create([
            'device_id' => $device->id,
            'type' => 'repair',
            'title' => 'OLED Screen Replacement',
            'description' => 'Flickering display panel repair under warranty SLA.',
            'performed_by' => 'J. Dela Cruz (Certified Tech)',
            'started_at' => Carbon::now()->subDays(2),
            'status' => 'in_progress',
            'cost' => 4500.00,
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Which devices are currently undergoing repairs and maintenance?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'maintenance_health',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['data_cards']);
        $this->assertEquals('maintenance', $data['data_cards'][0]['type']);
        $this->assertEquals('LAP-003', $data['data_cards'][0]['asset_tag']);
    }

    public function test_tagalog_query_resolves_accurately_with_fallback(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-004',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad T14s',
            'location' => 'BGC, Taguig City',
            'cpu' => 'AMD Ryzen 7',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'purchase_cost' => 88000.00,
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Meron bang available na ThinkPad laptop sa BGC?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'inventory_availability',
            ]);

        $data = $response->json();
        $this->assertNotEmpty($data['data_cards']);
        $this->assertEquals('LAP-004', $data['data_cards'][0]['asset_tag']);
    }

    public function test_query_idle_devices_in_inventory_returns_accurate_database_count(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-101',
            'device_type' => 'laptop',
            'ram_gb' => 16,
            'status' => 'available',
        ]);
        $this->createDevice([
            'asset_tag' => 'LAP-102',
            'device_type' => 'laptop',
            'ram_gb' => 32,
            'status' => 'available',
        ]);
        $this->createDevice([
            'asset_tag' => 'DSK-101',
            'device_type' => 'desktop',
            'ram_gb' => 64,
            'cpu_tier' => 'workstation',
            'status' => 'available',
        ]);
        $this->createDevice([
            'asset_tag' => 'LAP-103',
            'device_type' => 'laptop',
            'status' => 'assigned',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'How many idle devices do we currently have in inventory?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'inventory_availability',
            ]);

        $data = $response->json();
        $this->assertStringContainsString('3 idle (available) devices', $data['answer']);
        $this->assertStringContainsString('Laptops (2 units)', $data['answer']);
        $this->assertStringContainsString('Desktops & Workstations (1 units)', $data['answer']);
        $this->assertNotEmpty($data['data_cards']);
    }

    public function test_query_who_is_using_high_end_desktop_identifies_employee_and_mismatch(): void
    {
        $profile = RoleProfile::create([
            'name' => 'Administrative Staff',
            'department' => 'Operations',
            'min_cpu_tier' => 'entry',
            'min_ram_gb' => 8,
            'min_storage_gb' => 256,
        ]);

        $employee = Employee::create([
            'name' => 'Maria Clara Santos',
            'department' => 'Operations',
            'role_profile_id' => $profile->id,
        ]);

        $desktop = $this->createDevice([
            'asset_tag' => 'DSK-001',
            'device_type' => 'desktop',
            'brand' => 'Dell',
            'model' => 'Precision 7960 Tower',
            'cpu' => 'Intel Xeon w9-3495X',
            'cpu_tier' => 'workstation',
            'ram_gb' => 128,
            'storage_gb' => 4096,
            'status' => 'assigned',
        ]);

        Assignment::create([
            'device_id' => $desktop->id,
            'employee_id' => $employee->id,
            'assigned_at' => Carbon::now()->subDays(30),
            'match_score' => 0.45,
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Who is using the high end desktop?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'inventory_availability',
            ]);

        $data = $response->json();
        $this->assertStringContainsString('Maria Clara Santos', $data['answer']);
        $this->assertStringContainsString('Operations', $data['answer']);
        $this->assertStringContainsString('DSK-001', $data['answer']);
        $this->assertStringContainsString('Over-provisioning Mismatch', $data['answer']);
        $this->assertNotEmpty($data['data_cards']);
        $this->assertEquals('DSK-001', $data['data_cards'][0]['asset_tag']);
    }

    public function test_query_which_employees_using_high_end_computers_lists_provisioned_staff(): void
    {
        $engProfile = RoleProfile::create([
            'name' => 'Software Engineer',
            'department' => 'Engineering',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 512,
        ]);

        $emp1 = Employee::create([
            'name' => 'Alwyn Adriano',
            'department' => 'Engineering',
            'role_profile_id' => $engProfile->id,
        ]);

        $dev1 = $this->createDevice([
            'asset_tag' => 'LAP-002',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'XPS 15 9530',
            'cpu' => 'Intel Core i9',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'status' => 'assigned',
        ]);

        Assignment::create([
            'device_id' => $dev1->id,
            'employee_id' => $emp1->id,
            'assigned_at' => Carbon::now()->subDays(10),
            'match_score' => 0.95,
            'assignment_source' => 'ai_recommended',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Which employees is using the high end computers?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'category' => 'inventory_availability',
            ]);

        $data = $response->json();
        $this->assertStringContainsString('Alwyn Adriano', $data['answer']);
        $this->assertStringContainsString('Dell XPS 15', $data['answer']);
        $this->assertNotEmpty($data['data_cards']);
    }

    public function test_query_employees_using_low_end_specs_returns_table_and_real_data(): void
    {
        $creativeProfile = RoleProfile::create([
            'name' => 'Video & Motion Designer',
            'department' => 'Creative & Marketing',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
        ]);

        $bianca = Employee::create([
            'name' => 'Bianca Nicole Reyes',
            'department' => 'Creative & Marketing',
            'role_profile_id' => $creativeProfile->id,
        ]);

        $laptop = $this->createDevice([
            'asset_tag' => 'LAP-008',
            'device_type' => 'laptop',
            'brand' => 'Acer',
            'model' => 'Aspire 3',
            'cpu' => 'Intel Core i3-1215U',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_gb' => 256,
            'status' => 'assigned',
        ]);

        Assignment::create([
            'device_id' => $laptop->id,
            'employee_id' => $bianca->id,
            'assigned_at' => Carbon::now()->subDays(15),
            'match_score' => 0.40,
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Which employees are using low end specs?',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json();
        $this->assertStringContainsString('| Employee | Department | Role Profile | Assigned Machine | Tag | Hardware Specs | Match / Fit Status |', $data['answer']);
        $this->assertStringContainsString('Bianca Nicole Reyes', $data['answer']);
        $this->assertStringContainsString('LAP-008', $data['answer']);
        $this->assertStringContainsString('8GB RAM', $data['answer']);
        $this->assertNotEmpty($data['data_cards']);
    }

    public function test_assistant_retains_conversation_history_memory(): void
    {
        $creativeProfile = RoleProfile::create([
            'name' => 'Video & Motion Designer',
            'department' => 'Creative & Marketing',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
        ]);

        $bianca = Employee::create([
            'name' => 'Bianca Nicole Reyes',
            'department' => 'Creative & Marketing',
            'role_profile_id' => $creativeProfile->id,
        ]);

        $laptop = $this->createDevice([
            'asset_tag' => 'LAP-008',
            'device_type' => 'laptop',
            'brand' => 'Acer',
            'model' => 'Aspire 3',
            'cpu' => 'Intel Core i3-1215U',
            'cpu_tier' => 'entry',
            'ram_gb' => 8,
            'storage_gb' => 256,
            'status' => 'assigned',
        ]);

        Assignment::create([
            'device_id' => $laptop->id,
            'employee_id' => $bianca->id,
            'assigned_at' => Carbon::now()->subDays(15),
            'match_score' => 0.40,
            'assignment_source' => 'manual_override',
        ]);

        $upgradeLaptop = $this->createDevice([
            'asset_tag' => 'LAP-012',
            'device_type' => 'laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad X1 Carbon Gen 11',
            'cpu' => 'Intel Core i7-1365U',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_gb' => 1024,
            'status' => 'available',
        ]);

        // Follow-up query referring to "her" or "Bianca" with conversation history
        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'Can we upgrade her machine?',
            'history' => [
                [
                    'role' => 'user',
                    'content' => 'Which employees are using low end specs?',
                ],
                [
                    'role' => 'assistant',
                    'content' => 'Currently, Bianca Nicole Reyes is using an 8GB Acer Aspire LAP-008 which is under-provisioned.',
                ],
            ],
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json();
        $this->assertStringContainsString('Upgrade Plan for Bianca Nicole Reyes', $data['answer']);
        $this->assertStringContainsString('LAP-012', $data['answer']);
        $this->assertNotEmpty($data['data_cards']);
    }

    public function test_total_company_devices_query_returns_all_devices_breakdown_and_no_data_cards(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-001',
            'status' => 'available',
            'ram_gb' => 16,
            'storage_gb' => 512,
        ]);
        $this->createDevice([
            'asset_tag' => 'LAP-002',
            'status' => 'assigned',
            'ram_gb' => 32,
            'storage_gb' => 1024,
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'how many devices are there in a company',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json();
        $this->assertStringContainsString('2 total devices', $data['answer']);
        $this->assertStringContainsString('LAP-001', $data['answer']);
        $this->assertStringContainsString('LAP-002', $data['answer']);
        $this->assertEmpty($data['data_cards'], 'Factual count queries should not attach actionable cards');
        $this->assertArrayHasKey('ai_status', $data);
    }

    public function test_ram_tier_attribute_query_returns_exact_count_and_no_data_cards(): void
    {
        $this->createDevice([
            'asset_tag' => 'LAP-001',
            'brand' => 'Dell',
            'model' => 'XPS 15',
            'ram_gb' => 32,
            'storage_gb' => 1024,
        ]);
        $this->createDevice([
            'asset_tag' => 'LAP-002',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad',
            'ram_gb' => 16,
            'storage_gb' => 512,
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'how many computers have 32GB RAM',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json();
        $this->assertStringContainsString('1 computer', $data['answer']);
        $this->assertStringContainsString('LAP-001', $data['answer']);
        $this->assertEmpty($data['data_cards'], 'Attribute lookups should not attach actionable cards');
    }

    public function test_employee_ssd_storage_query_returns_straightforward_answer_without_data_cards(): void
    {
        $employee = Employee::create([
            'name' => 'Bianca Nicole Reyes',
            'department' => 'Creative & Marketing',
        ]);

        $device = $this->createDevice([
            'asset_tag' => 'LAP-008',
            'brand' => 'Acer',
            'model' => 'Aspire 3',
            'ram_gb' => 8,
            'storage_gb' => 256,
            'storage_type' => 'SSD',
            'status' => 'assigned',
        ]);

        Assignment::create([
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'assigned_at' => Carbon::now()->subMonths(3),
            'match_score' => 0.40,
            'assignment_source' => 'manual_override',
        ]);

        $response = $this->actingAs($this->user)->postJson(route('fleet-assistant.query'), [
            'prompt' => 'what is the SSD storage size does Bianca have',
        ]);

        $response->assertOk()
            ->assertJson([
                'success' => true,
            ]);

        $data = $response->json();
        $this->assertStringContainsString('Bianca Nicole Reyes', $data['answer']);
        $this->assertStringContainsString('256GB SSD', $data['answer']);
        $this->assertStringContainsString('LAP-008', $data['answer']);
        $this->assertEmpty($data['data_cards'], 'Employee SSD query must be straightforward without unnecessary data cards');
    }
}
