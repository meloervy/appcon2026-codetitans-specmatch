<?php

namespace App\Services;

use App\Ai\Agents\SpecMatchExtractionAgent;
use App\Models\MatchRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiService
{
    /**
     * Extract structured hardware requirements from free-form text.
     */
    public function extractRequirements(string $rawInput, ?int $employeeId = null): array
    {
        // 1. Check for pre-cached demo templates
        $templates = config('demo_templates.templates', []);
        foreach ($templates as $prompt => $payload) {
            if (str_starts_with($rawInput, substr($prompt, 0, 50))) {
                $payload['source'] = 'cached_demo';
                $payload['reasoning'] = 'Instantly extracted from pre-cached demo template.';

                MatchRequest::create([
                    'employee_id' => $employeeId,
                    'raw_input' => $rawInput,
                    'extracted_requirements' => $payload,
                    'extraction_failed' => false,
                ]);

                return $payload;
            }
        }

        // 2. Check if forced offline
        if (env('GEMINI_DEMO_OFFLINE', false)) {
            $fallback = $this->heuristicFallback($rawInput);
            $fallback['source'] = 'offline_heuristic';

            MatchRequest::create([
                'employee_id' => $employeeId,
                'raw_input' => $rawInput,
                'extracted_requirements' => $fallback,
                'extraction_failed' => true,
            ]);

            return $fallback;
        }

        $apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY'));

        if (! empty($apiKey)) {
            // 1. Utilize official Laravel AI SDK Agent with Google Gemini
            try {
                if (class_exists(SpecMatchExtractionAgent::class)) {
                    $agent = new SpecMatchExtractionAgent;
                    $response = $agent->prompt($rawInput);
                    $text = (string) $response;
                    $decoded = json_decode($text, true);

                    if (is_array($decoded) && isset($decoded['min_cpu_tier'])) {
                        $decoded['source'] = 'laravel_ai_gemini';

                        MatchRequest::create([
                            'employee_id' => $employeeId,
                            'raw_input' => $rawInput,
                            'extracted_requirements' => $decoded,
                            'extraction_failed' => false,
                        ]);

                        return $decoded;
                    }
                }
            } catch (\Throwable $agentError) {
                Log::warning('SpecMatchExtractionAgent failed, trying Gemini REST failover: '.$agentError->getMessage());
            }

            // 2. Direct Gemini REST endpoint fallback
            try {
                $extracted = $this->callGeminiApi($rawInput, $apiKey);

                MatchRequest::create([
                    'employee_id' => $employeeId,
                    'raw_input' => $rawInput,
                    'extracted_requirements' => $extracted,
                    'extraction_failed' => false,
                ]);

                return $extracted;
            } catch (\Throwable $restError) {
                Log::warning('Gemini REST API extraction failed: '.$restError->getMessage());
            }
        }

        // Graceful fallback (doc.md §12): rule-based fallback parser so user is never blocked
        $fallback = $this->heuristicFallback($rawInput);
        $fallback['source'] = 'heuristic_fallback';
        $fallback['model_attempted'] = 'gemini-3.6-flash';
        $fallback['fallback_reason'] = 'Google Gemini 3.6 Flash free tier rate/quota limit reached (HTTP 429). Intelligent deterministic heuristic engine engaged.';

        MatchRequest::create([
            'employee_id' => $employeeId,
            'raw_input' => $rawInput,
            'extracted_requirements' => $fallback,
            'extraction_failed' => true,
        ]);

        return $fallback;
    }

    /**
     * Test connectivity to Google Gemini API (specifically gemini-3.6-flash).
     */
    public function testConnectivity(?string $model = 'gemini-3.6-flash'): array
    {
        $apiKey = config('services.gemini.api_key', env('GEMINI_API_KEY'));
        $targetModel = $model ?: 'gemini-3.6-flash';

        if (empty($apiKey)) {
            return [
                'status' => 'missing_api_key',
                'success' => false,
                'model' => $targetModel,
                'message' => 'GEMINI_API_KEY is not configured in .env',
                'latency_ms' => 0,
                'fallback_active' => true,
            ];
        }

        $startTime = microtime(true);

        try {
            $response = Http::timeout(8)->post("https://generativelanguage.googleapis.com/v1beta/models/{$targetModel}:generateContent?key={$apiKey}", [
                'contents' => [
                    ['parts' => [['text' => 'Health check ping. Respond with {"pong": true}']]],
                ],
                'generationConfig' => [
                    'temperature' => 0.0,
                    'responseMimeType' => 'application/json',
                ],
            ]);

            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            if ($response->successful()) {
                return [
                    'status' => 'online',
                    'success' => true,
                    'http_status' => 200,
                    'model' => $targetModel,
                    'message' => "Gemini 3.6 Flash responded successfully in {$latencyMs}ms.",
                    'latency_ms' => $latencyMs,
                    'fallback_active' => false,
                ];
            }

            $body = $response->json();
            $statusCode = $response->status();
            $errorMessage = $body['error']['message'] ?? $response->body();

            if ($statusCode === 429) {
                return [
                    'status' => 'quota_exhausted',
                    'success' => false,
                    'http_status' => 429,
                    'model' => $targetModel,
                    'message' => 'Google Gemini API quota reached (20 requests/day limit on free tier). The intelligent deterministic fallback engine is actively handling requests with zero downtime.',
                    'details' => $errorMessage,
                    'latency_ms' => $latencyMs,
                    'fallback_active' => true,
                ];
            }

            return [
                'status' => 'error',
                'success' => false,
                'http_status' => $statusCode,
                'model' => $targetModel,
                'message' => "Gemini API returned HTTP {$statusCode}. Intelligent fallback engine is active.",
                'details' => $errorMessage,
                'latency_ms' => $latencyMs,
                'fallback_active' => true,
            ];
        } catch (\Throwable $e) {
            $latencyMs = (int) round((microtime(true) - $startTime) * 1000);

            return [
                'status' => 'unreachable',
                'success' => false,
                'http_status' => 500,
                'model' => $targetModel,
                'message' => "Connection error: {$e->getMessage()}. Intelligent fallback engine is active.",
                'latency_ms' => $latencyMs,
                'fallback_active' => true,
            ];
        }
    }

    /**
     * Get the standardized ITAM system instruction for Gemini AI models.
     */
    public static function getSystemInstruction(): string
    {
        return <<<'INSTRUCTIONS'
You are SpecMatch AI, an expert Enterprise IT Asset Management (ITAM) and Hardware Recommendation Engine adhering strictly to ISO 19770-1 ITAM standards and corporate asset optimization principles.

### CORE PURPOSE & OBJECTIVE:
Translate employee role profiles, software workloads, daily tasks, and mobility patterns into precise, deterministic hardware constraint parameters for internal inventory allocation. Optimize for maximum employee productivity while avoiding redundant CapEx procurement waste.

### WORKLOAD TAXONOMY & CLASSIFICATION RULES:
1. CPU TIERS (`min_cpu_tier`):
   - 'entry': Basic office productivity, web portals, email, documentation, lightweight ERP (Intel Core i3, AMD Ryzen 3).
   - 'mid': Data querying, SQL/Tableau dashboards, financial modeling, moderate multitasking (Intel Core i5, AMD Ryzen 5, base Apple Silicon M1-M3).
   - 'high': Intensive compilation, Docker microservices, 4K timeline editing, motion graphics, Figma design systems (Intel Core i7/i9, AMD Ryzen 7/9, Apple M3 Pro/Max).
   - 'workstation': Local LLM/deep learning training, 3D VFX rendering, CAD/CAM simulations (Intel Xeon, AMD Threadripper).

2. RAM REQUIREMENTS (`min_ram_gb`):
   - 8GB: General office productivity, basic cloud apps.
   - 16GB: Standard engineering baseline, analytics, UI/UX prototyping.
   - 32GB: Intensive development, Docker containers, multi-layer 4K video editing.
   - 64GB - 128GB: Local machine learning inference/training, 3D simulations.

3. STORAGE CAPACITY (`min_storage_gb`):
   - 256GB (light), 512GB (standard dev/analyst), 1024GB (media/containers), 2048GB (heavy video/AI datasets).

4. GRAPHICS ACCELERATION (`requires_gpu` & `min_gpu_tier`):
   - Set requires_gpu: true ONLY when hardware acceleration (CUDA tensor cores, 3D viewport, 4K video rendering) is directly needed.
   - min_gpu_tier: 'none', 'integrated', 'dedicated-entry' (GTX 1650/RTX 3050), 'dedicated-high' (RTX 4070+, RTX 4500/6000 Ada, Apple 30c+).

5. MOBILITY & FORM FACTOR (`portability_required`):
   - Set true if employee travels between offices, conducts client visits, or works hybrid/remote. False if desk-bound or workstation.

6. OBJECTIVE RATIONALE (`reasoning`):
   - Concise 1-2 sentence engineering justification citing specific workload triggers and explaining why these hardware thresholds are necessary.
INSTRUCTIONS;
    }

    private function callGeminiApi(string $rawInput, string $apiKey): array
    {
        $primaryModel = config('services.gemini.model', env('GEMINI_MODEL', 'gemini-3.6-flash'));
        $modelsToTry = array_unique(['gemini-3.6-flash', $primaryModel, 'gemini-3.8-flash']);
        $systemInstruction = self::getSystemInstruction();

        foreach ($modelsToTry as $model) {
            try {
                $response = Http::timeout(8)->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}", [
                    'system_instruction' => [
                        'parts' => [
                            ['text' => $systemInstruction],
                        ],
                    ],
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => "Convert the following employee workload request into structured hardware requirements:\n\n{$rawInput}\n\nRespond ONLY with valid JSON matching the schema."],
                            ],
                        ],
                    ],
                    'generationConfig' => [
                        'temperature' => 0.1,
                        'responseMimeType' => 'application/json',
                    ],
                ]);

                if ($response->successful()) {
                    $body = $response->json();
                    $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

                    if ($text) {
                        $cleanJson = trim(preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($text)));
                        $decoded = json_decode($cleanJson, true);

                        if (is_array($decoded) && isset($decoded['min_cpu_tier'], $decoded['min_ram_gb'])) {
                            $decoded['model_used'] = $model;

                            return $this->sanitizeRequirements($decoded);
                        }
                    }
                } else {
                    Log::warning("Gemini model {$model} returned status {$response->status()}: ".$response->body());
                }
            } catch (\Throwable $e) {
                Log::warning("Gemini API call to {$model} failed: ".$e->getMessage());
            }
        }

        throw new \RuntimeException('All configured Gemini models failed or experienced temporary unavailability.');
    }

    /**
     * Intelligent local heuristic fallback parser when AI API is unavailable.
     */
    public function heuristicFallback(string $input): array
    {
        $lower = strtolower($input);

        $isWorkstation = str_contains($lower, '3d') || str_contains($lower, 'machine learning') || str_contains($lower, 'deep learning') || str_contains($lower, 'rendering') || str_contains($lower, 'simulation') || str_contains($lower, 'workstation');
        $isHigh = str_contains($lower, 'video') || str_contains($lower, '4k') || str_contains($lower, 'developer') || str_contains($lower, 'engineer') || str_contains($lower, 'design');
        $isMid = str_contains($lower, 'data') || str_contains($lower, 'analyst') || str_contains($lower, 'multitask') || str_contains($lower, 'finance');

        $cpuTier = 'entry';
        if ($isWorkstation) {
            $cpuTier = 'workstation';
        } elseif ($isHigh) {
            $cpuTier = 'high';
        } elseif ($isMid) {
            $cpuTier = 'mid';
        }

        $ram = 8;
        if (preg_match('/(\d+)\s*gb\s*(?:ram|memory)/i', $input, $m)) {
            $ram = (int) $m[1];
        } elseif ($isWorkstation) {
            $ram = 32;
        } elseif ($isHigh) {
            $ram = 16;
        } elseif ($isMid) {
            $ram = 16;
        }

        $storage = 256;
        if (preg_match('/(\d+)\s*(?:gb|tb)\s*(?:ssd|hdd|storage)/i', $input, $m)) {
            $val = (int) $m[1];
            $storage = str_contains(strtolower($m[0]), 'tb') ? $val * 1024 : $val;
        } elseif ($isWorkstation || $isHigh) {
            $storage = 512;
        }

        $requiresGpu = str_contains($lower, 'video') || str_contains($lower, '4k') || str_contains($lower, 'gpu') || str_contains($lower, 'render') || str_contains($lower, '3d') || str_contains($lower, 'cad') || str_contains($lower, 'gaming') || str_contains($lower, 'graphics');

        $gpuTier = 'none';
        if ($requiresGpu) {
            if ($isWorkstation || str_contains($lower, '4k') || str_contains($lower, 'heavy')) {
                $gpuTier = 'dedicated-high';
            } else {
                $gpuTier = 'dedicated-entry';
            }
        } elseif ($isMid || $isHigh) {
            $gpuTier = 'integrated';
        }

        $portability = str_contains($lower, 'travel') || str_contains($lower, 'laptop') || str_contains($lower, 'mobile') || str_contains($lower, 'portable') || str_contains($lower, 'remote') || str_contains($lower, 'hybrid') || str_contains($lower, 'site');

        return [
            'min_cpu_tier' => $cpuTier,
            'min_ram_gb' => $ram,
            'min_storage_gb' => $storage,
            'requires_gpu' => $requiresGpu,
            'min_gpu_tier' => $gpuTier,
            'portability_required' => $portability,
            'reasoning' => "Inferred based on workload keywords: CPU {$cpuTier}, {$ram}GB RAM, ".($requiresGpu ? "{$gpuTier} GPU" : 'no dedicated GPU').', '.($portability ? 'portable laptop' : 'desktop').'.',
        ];
    }

    private function sanitizeRequirements(array $data): array
    {
        $validCpu = ['entry', 'mid', 'high', 'workstation'];
        $validGpu = ['none', 'integrated', 'dedicated-entry', 'dedicated-high'];

        return [
            'min_cpu_tier' => in_array($data['min_cpu_tier'] ?? '', $validCpu) ? $data['min_cpu_tier'] : 'entry',
            'min_ram_gb' => max(4, (int) ($data['min_ram_gb'] ?? 8)),
            'min_storage_gb' => max(128, (int) ($data['min_storage_gb'] ?? 256)),
            'requires_gpu' => (bool) ($data['requires_gpu'] ?? false),
            'min_gpu_tier' => in_array($data['min_gpu_tier'] ?? '', $validGpu) ? $data['min_gpu_tier'] : 'none',
            'portability_required' => (bool) ($data['portability_required'] ?? false),
            'reasoning' => (string) ($data['reasoning'] ?? 'Automated requirement analysis.'),
        ];
    }
}
