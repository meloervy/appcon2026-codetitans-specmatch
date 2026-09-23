<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class EmployeeProfilePictureTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_employee_defaults_to_default_profile_picture(): void
    {
        $employee = Employee::create([
            'name' => 'Test Employee',
            'department' => 'Operations',
        ]);

        $this->assertEquals('public/user/default-profile-picture.png', $employee->profile_picture);
        $this->assertEquals('/user/default-profile-picture.png', $employee->profile_picture_url);
    }

    public function test_custom_profile_picture_normalization(): void
    {
        $emp1 = Employee::create([
            'name' => 'Custom Path Employee',
            'department' => 'Design',
            'profile_picture' => 'public/avatars/user-123.jpg',
        ]);

        $this->assertEquals('/avatars/user-123.jpg', $emp1->profile_picture_url);

        $emp2 = Employee::create([
            'name' => 'Web URL Employee',
            'department' => 'Engineering',
            'profile_picture' => 'https://example.com/avatar.png',
        ]);

        $this->assertEquals('https://example.com/avatar.png', $emp2->profile_picture_url);
    }

    public function test_can_register_employee_with_profile_picture_via_controller(): void
    {
        $response = $this->actingAs($this->user)->post('/employees', [
            'name' => 'Elena Rostova',
            'department' => 'Analytics',
            'profile_picture' => 'public/user/default-profile-picture.png',
            'notes' => 'New team hire',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('employees', [
            'name' => 'Elena Rostova',
            'profile_picture' => 'public/user/default-profile-picture.png',
        ]);
    }

    public function test_can_update_employee_profile_picture(): void
    {
        $employee = Employee::create([
            'name' => 'Original Name',
            'department' => 'Marketing',
        ]);

        $response = $this->actingAs($this->user)->put("/employees/{$employee->id}", [
            'name' => 'Original Name',
            'department' => 'Marketing',
            'profile_picture' => 'https://images.unsplash.com/photo-test.png',
        ]);

        $response->assertRedirect();
        $employee->refresh();
        $this->assertEquals('https://images.unsplash.com/photo-test.png', $employee->profile_picture);
        $this->assertEquals('https://images.unsplash.com/photo-test.png', $employee->profile_picture_url);
    }

    public function test_can_upload_profile_picture_file_on_create(): void
    {
        $file = UploadedFile::fake()->create('custom_avatar.png', 50, 'image/png');

        $response = $this->actingAs($this->user)->post('/employees', [
            'name' => 'Uploaded Avatar Employee',
            'department' => 'Creative',
            'profile_picture_file' => $file,
        ]);

        $response->assertRedirect();

        $employee = Employee::where('name', 'Uploaded Avatar Employee')->firstOrFail();
        $this->assertStringStartsWith('public/user/uploads/emp_', $employee->profile_picture);
        $this->assertStringEndsWith('.png', $employee->profile_picture);
        $this->assertStringStartsWith('/user/uploads/emp_', $employee->profile_picture_url);

        // Clean up uploaded test file
        $filePath = public_path(substr($employee->profile_picture, 7));
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
    }

    public function test_can_upload_profile_picture_file_on_update(): void
    {
        $employee = Employee::create([
            'name' => 'Update Avatar Employee',
            'department' => 'Engineering',
        ]);

        $file = UploadedFile::fake()->create('new_avatar.jpg', 50, 'image/jpeg');

        $response = $this->actingAs($this->user)->post("/employees/{$employee->id}", [
            'name' => 'Update Avatar Employee',
            'department' => 'Engineering',
            'profile_picture_file' => $file,
        ]);

        $response->assertRedirect();

        $employee->refresh();
        $this->assertStringStartsWith('public/user/uploads/emp_', $employee->profile_picture);
        $this->assertStringEndsWith('.jpg', $employee->profile_picture);
        $this->assertStringStartsWith('/user/uploads/emp_', $employee->profile_picture_url);

        // Clean up uploaded test file
        $filePath = public_path(substr($employee->profile_picture, 7));
        if (file_exists($filePath)) {
            @unlink($filePath);
        }
    }
}
