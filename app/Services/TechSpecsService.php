<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TechSpecsService
{
    protected string $baseUrl = 'https://api.techspecs.io/v5';

    protected ?string $apiId;

    protected ?string $apiKey;

    public function __construct()
    {
        $this->apiId = config('services.techspecs.api_id', env('TECHSPECS_API_ID'));
        $this->apiKey = config('services.techspecs.api_key', env('TECHSPECS_API_KEY'));
    }

    /**
     * Search products in the TechSpecs hardware database.
     */
    public function searchProducts(string $query, string $category = '', int $size = 10): array
    {
        if (empty($this->apiId) || empty($this->apiKey)) {
            Log::warning('TechSpecs API credentials missing in configuration.');

            return [];
        }

        try {
            $params = [
                'query' => $query,
                'page' => 0,
                'size' => max(10, $size),
            ];

            if (! empty($category)) {
                $params['category'] = $category;
            }

            $response = Http::timeout(10)
                ->withHeaders([
                    'x-api-id' => $this->apiId,
                    'x-api-key' => $this->apiKey,
                    'accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}/products/search", $params);

            if (! $response->successful()) {
                Log::warning('TechSpecs Search API error: '.$response->body());

                return [];
            }

            $data = $response->json();
            $results = $data['data'] ?? [];

            // Standardize format
            return array_map(function ($item) {
                $prod = $item['Product'] ?? [];

                return [
                    'id' => $prod['english_id'] ?? $prod['id'] ?? ($item['_id'] ?? ''),
                    'brand' => $prod['Brand'] ?? '',
                    'model' => $prod['Model Name'] ?? $prod['Model'] ?? '',
                    'category' => $prod['Category'] ?? 'Laptops',
                    'version' => $prod['Version'] ?? '',
                    'release_date' => $item['Release Date'] ?? '',
                    'thumbnail' => $prod['Thumbnail'] ?? '',
                ];
            }, $results);
        } catch (\Throwable $e) {
            Log::error('TechSpecs search request failed: '.$e->getMessage());

            return [];
        }
    }

    /**
     * Fetch complete technical specifications for a single product by TechSpecs ID.
     */
    public function getProductDetail(string $productId): ?array
    {
        if (empty($this->apiId) || empty($this->apiKey)) {
            return null;
        }

        try {
            $response = Http::timeout(12)
                ->withHeaders([
                    'x-api-id' => $this->apiId,
                    'x-api-key' => $this->apiKey,
                    'accept' => 'application/json',
                ])
                ->get("{$this->baseUrl}/products/{$productId}", [
                    'lang' => 'en',
                ]);

            if (! $response->successful()) {
                Log::warning("TechSpecs Detail API error for {$productId}: ".$response->body());

                return null;
            }

            $json = $response->json();
            $data = $json['data'] ?? null;

            if (! $data) {
                return null;
            }

            return $this->mapToDeviceAttributes($data);
        } catch (\Throwable $e) {
            Log::error("TechSpecs detail fetch failed for {$productId}: ".$e->getMessage());

            return null;
        }
    }

    /**
     * Map complex TechSpecs nested JSON into SpecMatch normalized device attributes.
     */
    public function mapToDeviceAttributes(array $raw): array
    {
        $prod = $raw['Product'] ?? [];
        $inside = $raw['Inside'] ?? [];
        $keyAspects = $raw['Key Aspects'] ?? ($raw['KeyAspects'] ?? []);

        // Brand & Model
        $brand = $prod['Brand'] ?? '';
        $model = $prod['Model Name'] ?? $prod['Model'] ?? '';
        $category = strtolower($prod['Category'] ?? 'laptops');
        $deviceType = str_contains($category, 'desktop') ? 'desktop' : 'laptop';

        // CPU
        $cpuData = $inside['CPU'] ?? [];
        $cpuBrand = $cpuData['Brand'] ?? '';
        $cpuFamily = $cpuData['Family'] ?? '';
        $cpuModel = $cpuData['Model'] ?? '';
        $cpuName = trim("{$cpuBrand} {$cpuFamily} {$cpuModel}");
        if (empty($cpuName) && ! empty($keyAspects['Processor'])) {
            $cpuName = $keyAspects['Processor'];
        }
        if (empty($cpuName)) {
            $cpuName = 'Generic Processor';
        }

        $cpuTier = $this->inferCpuTier($cpuName);

        // RAM
        $ramRaw = $inside['RAM']['Capacity'] ?? ($keyAspects['RAM'] ?? '16 GB');
        $ramGb = $this->parseGb($ramRaw, 16);

        // Storage
        $storageRaw = $inside['Storage']['Total Capacity'] ?? ($inside['SSD']['Capacity'] ?? ($keyAspects['Storage'] ?? '512 GB'));
        $storageGb = $this->parseGb($storageRaw, 512);
        $storageType = (! empty($inside['HDD']) && empty($inside['SSD'])) ? 'HDD' : 'SSD';

        // GPU
        $gpuData = $inside['GPU'] ?? [];
        $dedicatedGpu = $gpuData['Dedicated Card Model'] ?? '';
        $integratedGpu = $gpuData['Integrated Card Model'] ?? ($keyAspects['Integrated Graphics Card'] ?? '');
        $gpuName = ! empty($dedicatedGpu) ? $dedicatedGpu : $integratedGpu;
        $gpuTier = $this->inferGpuTier($gpuName, ! empty($dedicatedGpu));

        // Release Date / Year
        $releaseDate = $keyAspects['Release Date'] ?? ($raw['Metadata']['ReleaseDate'] ?? '');
        $year = ! empty($releaseDate) && preg_match('/(\d{4})/', $releaseDate, $m) ? (int) $m[1] : (int) date('Y');

        // Image / Thumbnail
        $imageUrl = $raw['Thumbnail']['Image_1'] ?? ($raw['Thumbnail']['Image_2'] ?? null);
        if (empty($imageUrl) && ! empty($raw['Product']['Thumbnail'])) {
            $imageUrl = $raw['Product']['Thumbnail'];
        }
        if (empty($imageUrl)) {
            $imageUrl = HardwareImageService::resolveModelImage($brand, $model, $deviceType);
        }

        return [
            'brand' => $brand,
            'model' => $model,
            'device_type' => $deviceType,
            'cpu' => $cpuName,
            'cpu_tier' => $cpuTier,
            'ram_gb' => $ramGb,
            'storage_type' => $storageType,
            'storage_gb' => $storageGb,
            'gpu' => $gpuName ?: 'Integrated Graphics',
            'gpu_tier' => $gpuTier,
            'year_acquired' => $year,
            'techspecs_id' => $prod['english_id'] ?? ($raw['_id'] ?? null),
            'image_url' => $imageUrl,
        ];
    }

    private function parseGb(string $val, int $default): int
    {
        if (preg_match('/(\d+(?:\.\d+)?)\s*(GB|TB)/i', $val, $m)) {
            $num = (float) $m[1];

            return strtoupper($m[2]) === 'TB' ? (int) ($num * 1024) : (int) $num;
        }

        return $default;
    }

    private function inferCpuTier(string $cpu): string
    {
        $l = strtolower($cpu);
        if (str_contains($l, 'xeon') || str_contains($l, 'threadripper') || str_contains($l, 'epyc')) {
            return 'workstation';
        }
        if (str_contains($l, 'i9') || str_contains($l, 'i7') || str_contains($l, 'ryzen 9') || str_contains($l, 'ryzen 7') || str_contains($l, 'm3 pro') || str_contains($l, 'm3 max') || str_contains($l, 'm2 pro') || str_contains($l, 'm2 max') || str_contains($l, 'm1 max')) {
            return 'high';
        }
        if (str_contains($l, 'i5') || str_contains($l, 'ryzen 5') || str_contains($l, 'apple m') || str_contains($l, 'core ultra 5')) {
            return 'mid';
        }

        return 'entry';
    }

    private function inferGpuTier(string $gpu, bool $isDedicated): string
    {
        $l = strtolower($gpu);
        if (empty($gpu) || $l === 'none') {
            return 'none';
        }

        if (str_contains($l, 'rtx 40') || str_contains($l, 'rtx 3080') || str_contains($l, 'rtx 3090') || str_contains($l, 'ada') || str_contains($l, 'quadro') || str_contains($l, 'a6000') || str_contains($l, 'm3 max') || str_contains($l, 'radeon pro')) {
            return 'dedicated-high';
        }

        if ($isDedicated || str_contains($l, 'gtx') || str_contains($l, 'rtx 3050') || str_contains($l, 'rtx 4050') || str_contains($l, 'radeon rx')) {
            return 'dedicated-entry';
        }

        if (str_contains($l, 'iris') || str_contains($l, 'uhd') || str_contains($l, 'radeon graphics') || str_contains($l, 'integrated')) {
            return 'integrated';
        }

        return 'integrated';
    }
}
