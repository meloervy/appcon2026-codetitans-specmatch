<?php

namespace Tests\Feature;

use App\Ai\Agents\SpecMatchExtractionAgent;
use App\Services\GeminiService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Tests\TestCase;

class LaravelAiAgentTest extends TestCase
{
    use RefreshDatabase;

    public function test_specmatch_extraction_agent_implements_required_contracts(): void
    {
        $agent = new SpecMatchExtractionAgent;

        $this->assertInstanceOf(Agent::class, $agent);
        $this->assertInstanceOf(HasStructuredOutput::class, $agent);
        $this->assertStringContainsString('Enterprise IT Asset Management (ITAM)', (string) $agent->instructions());
    }

    public function test_ai_configuration_defaults_to_gemini(): void
    {
        $defaultProvider = config('ai.default');
        $geminiConfig = config('ai.providers.gemini');

        $this->assertEquals('gemini', $defaultProvider);
        $this->assertIsArray($geminiConfig);
        $this->assertEquals('gemini', $geminiConfig['driver']);
        $this->assertStringStartsWith('gemini-', $geminiConfig['models']['text']['default']);
    }

    public function test_gemini_service_uses_cached_demo_template_instantly(): void
    {
        $service = app(GeminiService::class);
        $result = $service->extractRequirements(
            'New senior video editor joining marketing. Needs to edit 4K footage in Premiere/After Effects and travels frequently between shoots.'
        );

        $this->assertEquals('cached_demo', $result['source']);
        $this->assertEquals('high', $result['min_cpu_tier']);
        $this->assertEquals(32, $result['min_ram_gb']);
        $this->assertTrue($result['requires_gpu']);
        $this->assertTrue($result['portability_required']);
    }

    public function test_gemini_service_heuristic_fallback_when_offline(): void
    {
        putenv('GEMINI_DEMO_OFFLINE=true');
        $_ENV['GEMINI_DEMO_OFFLINE'] = 'true';

        $service = app(GeminiService::class);
        $result = $service->extractRequirements(
            'We need a powerful desktop workstation for deep learning training with 64GB RAM and CUDA GPU'
        );

        putenv('GEMINI_DEMO_OFFLINE=false');
        $_ENV['GEMINI_DEMO_OFFLINE'] = 'false';

        $this->assertEquals('offline_heuristic', $result['source']);
        $this->assertEquals('workstation', $result['min_cpu_tier']);
        $this->assertEquals(64, $result['min_ram_gb']);
        $this->assertTrue($result['requires_gpu']);
        $this->assertFalse($result['portability_required']);
    }
}
