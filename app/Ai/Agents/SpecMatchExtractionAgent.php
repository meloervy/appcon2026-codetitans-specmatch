<?php

namespace App\Ai\Agents;

use Illuminate\Contracts\JsonSchema\JsonSchema;
use Laravel\Ai\Attributes\Model;
use Laravel\Ai\Attributes\Provider;
use Laravel\Ai\Contracts\Agent;
use Laravel\Ai\Contracts\Conversational;
use Laravel\Ai\Contracts\HasStructuredOutput;
use Laravel\Ai\Contracts\HasTools;
use Laravel\Ai\Contracts\Tool;
use Laravel\Ai\Messages\Message;
use Laravel\Ai\Promptable;
use Laravel\Ai\Providers\Tools\ProviderTool;
use Stringable;

#[Provider('gemini')]
#[Model('gemini-2.5-flash')]
class SpecMatchExtractionAgent implements Agent, Conversational, HasStructuredOutput, HasTools
{
    use Promptable;

    /**
     * Get the instructions that the agent should follow.
     */
    public function instructions(): Stringable|string
    {
        return <<<'INSTRUCTIONS'
You are the SpecMatch IT Hardware Requirement Extractor for enterprise IT asset management (ITAM).
Analyze the employee role, software tools, workloads, and mobility needs from the input description.
Extract objective, deterministic hardware constraints that will be used to score and allocate internal hardware assets:
- min_cpu_tier: 'entry' (office, web, email), 'mid' (multitasking, data analysis, standard dev), 'high' (Docker, compilation, 4K editing, heavy creative), 'workstation' (AI/ML training, 3D rendering, scientific compute).
- min_ram_gb: typically 8 (basic), 16 (standard engineering/design/data), 32 (video/high-end dev), 64+ (ML/heavy workstation).
- min_storage_gb: 256, 512, 1024, 2048.
- requires_gpu: true only if workload requires CUDA, 3D rendering, 4K timeline effects, or tensor compute.
- min_gpu_tier: 'none', 'integrated', 'dedicated-entry' (GTX/RTX 3050/Apple 14c), 'dedicated-high' (RTX 4070/4090/Ada/Apple 30c+).
- portability_required: true if employee travels, does on-site client presentations, or works hybrid/remote. False if primarily desk-bound or workstation.
- reasoning: a concise 1-2 sentence engineering justification explaining the recommendation.
INSTRUCTIONS;
    }

    /**
     * Get the list of messages comprising the conversation so far.
     *
     * @return Message[]
     */
    public function messages(): iterable
    {
        return [];
    }

    /**
     * Get the tools available to the agent.
     *
     * @return list<Agent|Tool|ProviderTool>
     */
    public function tools(): iterable
    {
        return [];
    }

    /**
     * Get the agent's structured output schema definition.
     */
    public function schema(JsonSchema $schema): array
    {
        return [
            'min_cpu_tier' => $schema->string()->enum(['entry', 'mid', 'high', 'workstation'])->required(),
            'min_ram_gb' => $schema->integer()->required(),
            'min_storage_gb' => $schema->integer()->required(),
            'requires_gpu' => $schema->boolean()->required(),
            'min_gpu_tier' => $schema->string()->enum(['none', 'integrated', 'dedicated-entry', 'dedicated-high'])->required(),
            'portability_required' => $schema->boolean()->required(),
            'reasoning' => $schema->string()->required(),
        ];
    }
}
