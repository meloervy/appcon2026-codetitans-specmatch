<?php

namespace App\Http\Controllers;

use App\Services\HardwareImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HardwareImageController extends Controller
{
    /**
     * Search and retrieve authentic hardware imagery from Wikimedia and the canonical registry.
     */
    public function lookup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'query' => ['nullable', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'device_type' => ['nullable', 'string', 'max:50'],
        ]);

        $brand = $validated['brand'] ?? '';
        $model = $validated['model'] ?? '';
        $deviceType = $validated['device_type'] ?? 'laptop';
        $query = $validated['query'] ?? trim($brand.' '.$model);

        $resolved = HardwareImageService::resolveModelImage($brand, $model, $deviceType);
        $results = ! empty($query) ? HardwareImageService::searchHardwareImages($query, $brand, $model) : [];

        $primary = $resolved ?? ($results[0]['image_url'] ?? null);

        return response()->json([
            'success' => ! empty($primary),
            'image_url' => $primary,
            'source' => $primary ? 'wikimedia' : 'none',
            'results' => $results,
            'primary_image' => $primary,
        ]);
    }
}
