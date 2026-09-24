<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the demo administrative and staff users for SpecMatch.
     *
     * Demo Credentials:
     * - IT Administrator: admin@specmatch.local / password (Role: admin)
     * - Asset Manager:    manager@specmatch.local / password (Role: manager)
     * - Hardware Tech:    tech@specmatch.local / password (Role: technician)
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@specmatch.local'],
            [
                'name' => 'IT Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'department' => 'IT Infrastructure & Systems',
                'job_title' => 'Chief IT Architect & Fleet Administrator',
                'phone' => '+63 917 123 4567',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'manager@specmatch.local'],
            [
                'name' => 'IT Asset Manager',
                'password' => Hash::make('password'),
                'role' => 'manager',
                'department' => 'Asset Lifecycle & Procurement',
                'job_title' => 'IT Asset & Fleet Operations Manager',
                'phone' => '+63 918 234 5678',
                'email_verified_at' => now(),
            ]
        );

        User::updateOrCreate(
            ['email' => 'tech@specmatch.local'],
            [
                'name' => 'Hardware Technician',
                'password' => Hash::make('password'),
                'role' => 'technician',
                'department' => 'Hardware Diagnostics & Maintenance',
                'job_title' => 'Senior Hardware Diagnostic Specialist',
                'phone' => '+63 919 345 6789',
                'email_verified_at' => now(),
            ]
        );
    }
}
