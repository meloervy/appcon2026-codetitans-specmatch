<?php

namespace App\Http\Controllers;

use App\Services\FleetAiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FleetAssistantController extends Controller
{
    public function __construct(
        protected FleetAiAssistantService $assistantService,
    ) {}

    /**
     * Process a natural language query for the Gemini Fleet Assistant.
     */
    public function query(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'prompt' => ['required', 'string', 'max:1000'],
            'history' => ['nullable', 'array', 'max:12'],
            'history.*.role' => ['required', 'string', 'in:user,assistant,model'],
            'history.*.content' => ['required', 'string', 'max:50000'],
        ]);

        $userId = (int) $request->user()->id;
        $history = $validated['history'] ?? [];
        $result = $this->assistantService->handleQuery($validated['prompt'], $userId, $history);

        return response()->json($result);
    }

    /**
     * Provide initial context, starter suggestions, and summary metrics.
     */
    public function context(Request $request): JsonResponse
    {
        $snapshot = $this->assistantService->aggregateContextSnapshot();

        return response()->json([
            'metrics' => $snapshot['metrics'],
            'starter_followups' => $this->assistantService->getDefaultFollowups(),
            'ai_status' => $this->assistantService->getAiStatus(),
        ]);
    }
}
