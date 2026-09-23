<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_renders_metrics_and_detects_mismatches_with_seeded_data(): void
    {
        $this->seed(DatabaseSeeder::class);
        $user = User::where('email', 'admin@specmatch.local')->first();

        $response = $this->actingAs($user)->get('/dashboard');
        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Dashboard/Index')
            ->has('metrics')
            ->where('metrics.mismatch_count', 3)
            ->has('mismatches')
            ->has('recent_assignments')
            ->has('available_fleet')
        );
    }

    public function test_mismatches_index_renders_all_flagged_assignments(): void
    {
        $this->seed(DatabaseSeeder::class);
        $user = User::where('email', 'admin@specmatch.local')->first();

        $response = $this->actingAs($user)->get('/mismatches');
        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Mismatches/Index')
            ->has('mismatches', 3)
            ->where('threshold', 0.65)
        );
    }
}
