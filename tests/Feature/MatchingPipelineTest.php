<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchingPipelineTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_unauthenticated_user_cannot_access_match_pipeline(): void
    {
        $response = $this->get('/match');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_match_page(): void
    {
        $response = $this->actingAs($this->user)->get('/match');
        $response->assertOk();
    }

    public function test_extract_endpoint_returns_structured_requirements(): void
    {
        $response = $this->actingAs($this->user)->postJson('/match/extract', [
            'raw_input' => 'Senior video editor needing 4K video rendering and portability for travel',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'success',
            'requirements' => [
                'min_cpu_tier',
                'min_ram_gb',
                'min_storage_gb',
                'requires_gpu',
                'min_gpu_tier',
                'portability_required',
                'reasoning',
            ],
        ]);

        $data = $response->json('requirements');
        $this->assertTrue($data['requires_gpu']);
        $this->assertTrue($data['portability_required']);
    }

    public function test_rank_endpoint_ranks_devices(): void
    {
        Device::create([
            'asset_tag' => 'RANK-001',
            'device_type' => 'laptop',
            'brand' => 'Apple',
            'model' => 'MacBook Pro',
            'cpu' => 'M3 Pro',
            'cpu_tier' => 'high',
            'ram_gb' => 36,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu_tier' => 'dedicated-high',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
        ]);

        $response = $this->actingAs($this->user)->postJson('/match/rank', [
            'requirements' => [
                'min_cpu_tier' => 'high',
                'min_ram_gb' => 32,
                'min_storage_gb' => 1024,
                'requires_gpu' => true,
                'min_gpu_tier' => 'dedicated-high',
                'portability_required' => true,
            ],
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'results',
            'procurement_recommended',
            'threshold',
        ]);

        $results = $response->json('results');
        $this->assertNotEmpty($results);
        $this->assertEquals('RANK-001', $results[0]['device']['asset_tag']);
        $this->assertGreaterThanOrEqual(0.65, $results[0]['score']);
    }

    public function test_assign_device_endpoint_succeeds(): void
    {
        $device = Device::create([
            'asset_tag' => 'ASG-001',
            'device_type' => 'laptop',
            'brand' => 'Dell',
            'model' => 'XPS 13',
            'cpu' => 'Intel i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
        ]);

        $employee = Employee::create([
            'name' => 'Sara Connor',
            'department' => 'Operations',
        ]);

        $response = $this->actingAs($this->user)->post('/match/assign', [
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'assignment_source' => 'ai_recommended',
            'match_score' => 0.92,
        ]);

        $response->assertRedirect('/dashboard');
        $this->assertEquals('assigned', $device->fresh()->status);
        $this->assertDatabaseHas('assignments', [
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'unassigned_at' => null,
        ]);
    }

    public function test_match_page_provides_deployable_inventory_summary(): void
    {
        Device::create([
            'asset_tag' => 'DEP-001',
            'device_type' => 'laptop',
            'brand' => 'Lenovo',
            'model' => 'ThinkPad',
            'cpu' => 'Intel i7',
            'cpu_tier' => 'high',
            'ram_gb' => 32,
            'storage_type' => 'SSD',
            'storage_gb' => 1024,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2024,
            'condition' => 'excellent',
            'status' => 'available',
            'lifecycle_stage' => 'deployment',
        ]);

        $response = $this->actingAs($this->user)->get('/match');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Match/Request')
            ->has('deployable_summary')
            ->where('deployable_summary.total_available', 1)
            ->where('deployable_summary.laptops_count', 1)
        );
    }

    public function test_gemini_connectivity_endpoint_responds_with_diagnostic_structure(): void
    {
        $response = $this->actingAs($this->user)->postJson('/match/test-gemini', [
            'model' => 'gemini-3.6-flash',
        ]);

        $response->assertOk();
        $response->assertJsonStructure([
            'status',
            'model',
            'message',
            'fallback_active',
        ]);
        $this->assertEquals('gemini-3.6-flash', $response->json('model'));
    }
}
