<?php

namespace Tests\Unit;

use App\Models\Device;
use App\Services\MatchingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MatchingServiceScoringTest extends TestCase
{
    use RefreshDatabase;

    private MatchingService $matchingService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->matchingService = new MatchingService;
    }

    /**
     * Contest Constraint #2 verification:
     * Displayed criteria sub-scores multiplied by criteria weights must strictly reconcile to final score.
     */
    public function test_weighted_score_matches_displayed_formula(): void
    {
        $subScores = [
            'cpu_tier_match_score' => 0.92,
            'ram_sufficiency_score' => 1.00,
            'storage_sufficiency_score' => 1.00,
            'gpu_match_score' => 1.00,
            'portability_match_score' => 0.68,
        ];

        $expected = (0.92 * 0.30) + (1.00 * 0.25) + (1.00 * 0.15) + (1.00 * 0.20) + (0.68 * 0.10);
        // expected = 0.944

        $actual = $this->matchingService->computeFinalScore($subScores);

        $this->assertEqualsWithDelta($expected, $actual, 0.001);
    }

    /**
     * Verify internal key format also resolves cleanly and reconciles identically.
     */
    public function test_scoring_with_internal_keys(): void
    {
        $subScores = [
            'cpu' => 0.75,
            'ram' => 0.85,
            'storage' => 0.85,
            'gpu' => 0.90,
            'portability' => 1.00,
        ];

        $expected = (0.75 * 0.30) + (0.85 * 0.25) + (0.85 * 0.15) + (0.90 * 0.20) + (1.00 * 0.10);
        // expected = 0.845

        $actual = $this->matchingService->computeFinalScore($subScores);

        $this->assertEqualsWithDelta($expected, $actual, 0.001);
    }

    /**
     * Verify third sample from evidence table (HP EliteBook 840 G10):
     * CPU: 75%, RAM: 85%, Disk: 85%, GPU: 90%, Port: 68% -> 81.3%
     */
    public function test_sample_three_reconciles_with_displayed_weights(): void
    {
        $subScores = [
            'cpu' => 0.75,
            'ram' => 0.85,
            'storage' => 0.85,
            'gpu' => 0.90,
            'portability' => 0.68,
        ];

        $expected = (0.75 * 0.30) + (0.85 * 0.25) + (0.85 * 0.15) + (0.90 * 0.20) + (0.68 * 0.10);
        // expected = 0.813

        $actual = $this->matchingService->computeFinalScore($subScores);

        $this->assertEqualsWithDelta($expected, $actual, 0.001);
    }

    /**
     * Verify that evaluateDevice produces a score identical to computeFinalScore for evaluated devices.
     */
    public function test_evaluate_device_produces_exact_reconciled_score(): void
    {
        $device = Device::create([
            'asset_tag' => 'TEST-RECON-01',
            'device_type' => 'laptop',
            'brand' => 'HP',
            'model' => '250 G8',
            'cpu' => 'Intel Core i5',
            'cpu_tier' => 'mid',
            'ram_gb' => 16,
            'storage_type' => 'SSD',
            'storage_gb' => 512,
            'gpu' => null,
            'gpu_tier' => 'integrated',
            'year_acquired' => 2023,
            'condition' => 'good',
            'status' => 'available',
        ]);

        $requirements = [
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
        ];

        $eval = $this->matchingService->evaluateDevice($device, $requirements);

        $this->assertFalse($eval['disqualified']);
        $recomputed = $this->matchingService->computeFinalScore($eval['subscores'], $eval['subscore_audit']['weights'] ?? null);

        $this->assertEqualsWithDelta($recomputed, $eval['score'], 0.001);
        $this->assertEqualsWithDelta($eval['score'], $eval['base_score'], 0.001);
    }
}
