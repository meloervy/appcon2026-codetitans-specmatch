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
            try {
                // 1. Utilize official Laravel AI SDK Agent with Google Gemini
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

                // 2. Direct Gemini REST endpoint fallback
                $extracted = $this->callGeminiApi($rawInput, $apiKey);

                MatchRequest::create([
                    'employee_id' => $employeeId,
                    'raw_input' => $rawInput,
                    'extracted_requirements' => $extracted,
                    'extraction_failed' => false,
                ]);

                return $extracted;
            } catch (\Throwable $e) {
                Log::warning('Gemini extraction failed: '.$e->getMessage());
            }
        }

        // Graceful fallback (doc.md §12): rule-based fallback parser so user is never blocked
        $fallback = $this->heuristicFallback($rawInput);

        MatchRequest::create([
            'employee_id' => $employeeId,
            'raw_input' => $rawInput,
            'extracted_requirements' => $fallback,
            'extraction_failed' => true,
        ]);

        return $fallback;
    }

    private function callGeminiApi(string $rawInput, string $apiKey): array
    {
        $prompt = <<<EOT
You are an IT hardware requirement extraction engine. Convert the following employee request into structured hardware requirements:

Request: "{$rawInput}"

Respond ONLY with a valid JSON object matching this schema exactly, with NO markdown backticks, NO formatting, and NO extra commentary:
{
  "min_cpu_tier": "entry | mid | high | workstation",
  "min_ram_gb": 8 | 16 | 32 | 64,
  "min_storage_gb": 256 | 512 | 1024 | 2048,
  "requires_gpu": true | false,
  "min_gpu_tier": "none | integrated | dedicated-entry | dedicated-high",
  "portability_required": true | false,
  "reasoning": "one-sentence plain-language explanation of why these values were chosen"
}
EOT;

        $response = Http::timeout(10)->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}", [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                    ],
                ],
            ],
            'generationConfig' => [
                'temperature' => 0.1,
                'responseMimeType' => 'application/json',
            ],
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Gemini API returned status '.$response->status().': '.$response->body());
        }

        $body = $response->json();
        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (! $text) {
            throw new \RuntimeException('Empty or malformed Gemini response.');
        }

        // Clean markdown fences if any were returned
        $cleanJson = trim(preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($text)));
        $decoded = json_decode($cleanJson, true);

        if (! is_array($decoded) || ! isset($decoded['min_cpu_tier'], $decoded['min_ram_gb'])) {
            throw new \RuntimeException('Invalid JSON structure from Gemini.');
        }

        return $this->sanitizeRequirements($decoded);
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
