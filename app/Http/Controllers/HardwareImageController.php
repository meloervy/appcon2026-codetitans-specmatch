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
            'prefer' => ['nullable', 'string', 'in:public_asset,google_search,wikimedia,auto'],
        ]);

        $brand = $validated['brand'] ?? '';
        $model = $validated['model'] ?? '';
        $deviceType = $validated['device_type'] ?? 'laptop';
        $query = $validated['query'] ?? trim($brand.' '.$model);
        $prefer = $validated['prefer'] ?? null;

        $publicAsset = HardwareImageService::resolvePublicAssetImage($brand, $model, $deviceType);
        $googleImage = HardwareImageService::searchGoogleImages($query, $brand, $model);
        $canonical = HardwareImageService::resolveModelImage($brand, $model, $deviceType);
        $results = ! empty($query) ? HardwareImageService::searchHardwareImages($query, $brand, $model) : [];

        if ($prefer === 'public_asset') {
            $primary = $publicAsset ?? $canonical ?? ($results[0]['image_url'] ?? null);
            $source = 'public_asset';
        } elseif ($prefer === 'google_search') {
            $primary = $googleImage ?? $publicAsset ?? $canonical ?? ($results[0]['image_url'] ?? null);
            $source = $googleImage ? 'google_search' : ($publicAsset ? 'public_asset' : 'wikimedia');
        } elseif ($prefer === 'wikimedia') {
            $primary = $canonical ?? ($results[0]['image_url'] ?? null);
            $source = 'wikimedia';
        } else {
            // Default: if no prefer given (preserves tests expecting canonical wikimedia, with public asset fallback)
            $primary = $canonical ?? $publicAsset ?? ($results[0]['image_url'] ?? null);
            $source = $primary ? ($primary === $canonical ? 'wikimedia' : 'public_asset') : 'none';
        }

        return response()->json([
            'success' => ! empty($primary),
            'image_url' => $primary,
            'source' => $source,
            'public_asset_url' => $publicAsset,
            'google_image_url' => $googleImage,
            'results' => $results,
            'primary_image' => $primary,
        ]);
    }
}
