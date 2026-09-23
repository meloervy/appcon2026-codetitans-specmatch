<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_user_role_methods_and_title(): void
    {
        $admin = User::factory()->create(['role' => 'admin', 'department' => 'IT Systems']);
        $manager = User::factory()->create(['role' => 'manager', 'department' => 'Asset Management']);
        $tech = User::factory()->create(['role' => 'technician', 'department' => 'Diagnostics Bench']);

        $this->assertTrue($admin->isAdmin());
        $this->assertTrue($admin->isManager());
        $this->assertTrue($admin->isTechnician());
        $this->assertEquals('IT Administrator', $admin->role_title);

        $this->assertFalse($manager->isAdmin());
        $this->assertTrue($manager->isManager());
        $this->assertTrue($manager->isTechnician());
        $this->assertEquals('IT Asset Manager', $manager->role_title);

        $this->assertFalse($tech->isAdmin());
        $this->assertFalse($tech->isManager());
        $this->assertTrue($tech->isTechnician());
        $this->assertEquals('Hardware Technician', $tech->role_title);
    }
}
