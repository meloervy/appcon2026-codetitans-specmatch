<?php

namespace App\Http\Controllers;

use App\Services\TechSpecsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TechSpecsController extends Controller
{
    /**
     * Search TechSpecs hardware catalog.
     */
    public function search(Request $request, TechSpecsService $techSpecsService): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['required', 'string', 'min:2'],
            'category' => ['nullable', 'string'],
        ]);

        $results = $techSpecsService->searchProducts(
            $validated['query'],
            $validated['category'] ?? ''
        );

        return response()->json([
            'success' => true,
            'results' => $results,
        ]);
    }

    /**
     * Fetch complete specs and normalize for device auto-fill.
     */
    public function details(Request $request, TechSpecsService $techSpecsService): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'string'],
        ]);

        $specs = $techSpecsService->getProductDetail($validated['product_id']);

        if (!$specs) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve specifications for this product ID.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'specs' => $specs,
        ]);
    }
}
