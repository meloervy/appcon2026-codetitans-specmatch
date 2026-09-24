<?php

namespace Tests\Feature;

use App\Models\Device;
use App\Models\Employee;
use App\Models\User;
use App\Services\HardwareImageService;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HardwareImageLookupTest extends TestCase
{
    use RefreshDatabase;

    public function test_hardware_image_lookup_requires_authentication(): void
    {
        $response = $this->postJson('/hardware/image-lookup', [
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16',
        ]);

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_lookup_hardware_image(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/hardware/image-lookup', [
            'brand' => 'Apple',
            'model' => 'MacBook Pro 16 M3 Max',
            'device_type' => 'laptop',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'image_url', 'source'])
            ->assertJson(['success' => true]);

        $this->assertNotEmpty($response->json('image_url'));
        $this->assertStringContainsString('wikimedia.org', $response->json('image_url'));
    }

    public function test_hardware_image_service_resolves_canonical_models(): void
    {
        $macbook = HardwareImageService::resolveModelImage('Apple', 'MacBook Pro 14 M3 Pro');
        $this->assertNotNull($macbook);
        $this->assertStringContainsStringIgnoringCase('MacBook_Pro', $macbook);

        $thinkpad = HardwareImageService::resolveModelImage('Lenovo', 'ThinkPad T14 Gen 4');
        $this->assertNotNull($thinkpad);
        $this->assertStringContainsStringIgnoringCase('ThinkPad', $thinkpad);

        $dell = HardwareImageService::resolveModelImage('Dell', 'XPS 15 9530');
        $this->assertNotNull($dell);
        $this->assertStringContainsStringIgnoringCase('Dell_XPS', $dell);
    }

    public function test_authenticated_user_can_lookup_hardware_image_with_public_asset_preference(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/hardware/image-lookup', [
            'brand' => 'Apple',
            'model' => 'MacBook m5',
            'device_type' => 'laptop',
            'prefer' => 'public_asset',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'image_url', 'source', 'public_asset_url'])
            ->assertJson([
                'success' => true,
                'source' => 'public_asset',
                'image_url' => '/images/devices/apple-macbook-pro.jpg',
            ]);
    }

    public function test_authenticated_user_can_lookup_hardware_image_with_google_search_preference(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/hardware/image-lookup', [
            'brand' => 'Dell',
            'model' => 'XPS 15',
            'device_type' => 'laptop',
            'prefer' => 'google_search',
        ]);

        $response->assertOk()
            ->assertJsonStructure(['success', 'image_url', 'source'])
            ->assertJson(['success' => true]);

        $this->assertNotEmpty($response->json('image_url'));
    }

    public function test_hardware_image_service_resolves_curated_public_asset_images(): void
    {
        $macbook = HardwareImageService::resolvePublicAssetImage('Apple', 'MacBook m5');
        $this->assertEquals('/images/devices/apple-macbook-pro.jpg', $macbook);

        $macbookAir = HardwareImageService::resolvePublicAssetImage('Apple', 'MacBook Air M3');
        $this->assertEquals('/images/devices/apple-macbook-air.jpg', $macbookAir);

        $thinkpad = HardwareImageService::resolvePublicAssetImage('Lenovo', 'ThinkPad T14 Gen 4');
        $this->assertEquals('/images/devices/lenovo-thinkpad.jpg', $thinkpad);

        $thinkpadX1 = HardwareImageService::resolvePublicAssetImage('Lenovo', 'ThinkPad X1 Carbon');
        $this->assertEquals('/images/devices/lenovo-thinkpad-x1.jpg', $thinkpadX1);

        $xps = HardwareImageService::resolvePublicAssetImage('Dell', 'XPS 15');
        $this->assertEquals('/images/devices/dell-xps.jpg', $xps);
    }

    public function test_seeded_database_includes_real_team_members(): void
    {
        $this->seed(DatabaseSeeder::class);

        $teamNames = [
            'Aaron Creed Celindro',
            'Alwyn Adriano',
            'Kent Joshua A. Olimberio',
            'Melo Ervy Garcia',
        ];

        foreach ($teamNames as $name) {
            $this->assertDatabaseHas('employees', [
                'name' => $name,
            ]);
        }

        // Verify team members have devices assigned
        $celindro = Employee::where('name', 'Aaron Creed Celindro')->first();
        $this->assertNotNull($celindro->currentDevice);
        $this->assertEquals('Lenovo', $celindro->currentDevice->brand);

        $adriano = Employee::where('name', 'Alwyn Adriano')->first();
        $this->assertNotNull($adriano->currentDevice);
        $this->assertEquals('Dell', $adriano->currentDevice->brand);

        $olimberio = Employee::where('name', 'Kent Joshua A. Olimberio')->first();
        $this->assertNotNull($olimberio->currentDevice);
        $this->assertEquals('Apple', $olimberio->currentDevice->brand);
        $this->assertEquals('UI/UX Designer', $olimberio->roleProfile->name);

        $garcia = Employee::where('name', 'Melo Ervy Garcia')->first();
        $this->assertNotNull($garcia->currentDevice);
        $this->assertEquals('Apple', $garcia->currentDevice->brand);
        $this->assertEquals('Product Designer', $garcia->roleProfile->name);
    }

    public function test_seeded_devices_have_metro_manila_locations(): void
    {
        $this->seed(DatabaseSeeder::class);

        $devices = Device::all();
        $this->assertGreaterThan(0, $devices->count());

        $hasManilaLocation = $devices->contains(function ($device) {
            return str_contains($device->location, 'BGC, Taguig')
                || str_contains($device->location, 'Makati CBD')
                || str_contains($device->location, 'Ortigas Center, Pasig')
                || str_contains($device->location, 'Eastwood, Quezon City')
                || str_contains($device->location, 'Alabang, Muntinlupa');
        });

        $this->assertTrue($hasManilaLocation);
    }
}
