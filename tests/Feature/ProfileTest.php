<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertNull($user->fresh());
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }

    public function test_profile_extended_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'IT Admin User',
                'email' => 'admin@example.com',
                'job_title' => 'Chief IT Architect',
                'department' => 'IT Infrastructure & Systems',
                'phone' => '+63 917 123 4567',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('IT Admin User', $user->name);
        $this->assertSame('Chief IT Architect', $user->job_title);
        $this->assertSame('Chief IT Architect', $user->role_title);
        $this->assertSame('IT Infrastructure & Systems', $user->department);
        $this->assertSame('+63 917 123 4567', $user->phone);
    }

    public function test_user_can_upload_profile_avatar(): void
    {
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('profile.jpg', 50, 'image/jpeg');

        $response = $this
            ->actingAs($user)
            ->post('/profile', [
                '_method' => 'patch',
                'name' => $user->name,
                'email' => $user->email,
                'avatar_file' => $file,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertNotNull($user->avatar_url);
        $this->assertStringContainsString('user/uploads', $user->avatar_url);

        $publicPath = public_path(str_replace('public/', '', $user->avatar));
        if (file_exists($publicPath)) {
            @unlink($publicPath);
        }
    }
}
