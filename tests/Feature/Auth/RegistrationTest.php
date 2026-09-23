<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_new_users_can_register_with_role_and_department(): void
    {
        $response = $this->post('/register', [
            'name' => 'IT Specialist',
            'email' => 'specialist@specmatch.local',
            'role' => 'manager',
            'department' => 'Hardware Asset Lifecycle',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertAuthenticated();
        $this->assertDatabaseHas('users', [
            'email' => 'specialist@specmatch.local',
            'role' => 'manager',
            'department' => 'Hardware Asset Lifecycle',
        ]);
        $response->assertRedirect(route('dashboard', absolute: false));
    }
}
