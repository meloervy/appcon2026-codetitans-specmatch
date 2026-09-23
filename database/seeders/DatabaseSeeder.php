<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\RoleProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Seed IT Staff User
        User::updateOrCreate(
            ['email' => 'admin@specmatch.local'],
            [
                'name' => 'IT Administrator',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Role Profiles (doc.md §12: 4-6 profiles)
        $softwareEngineer = RoleProfile::create([
            'name' => 'Software Engineer',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
            'description' => 'Docker, IDEs, local compilation, and microservices development.',
        ]);

        $videoEditor = RoleProfile::create([
            'name' => 'Video & Motion Designer',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-high',
            'portability_required' => true,
            'description' => '4K video rendering, Adobe Premiere, After Effects, and color grading.',
        ]);

        $dataAnalyst = RoleProfile::create([
            'name' => 'Data Analyst',
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => false,
            'description' => 'SQL querying, Tableau/PowerBI, heavy Excel datasets, and statistical models.',
        ]);

        $adminStaff = RoleProfile::create([
            'name' => 'Administrative Staff',
            'min_cpu_tier' => 'entry',
            'min_ram_gb' => 8,
            'min_storage_gb' => 256,
            'requires_gpu' => false,
            'min_gpu_tier' => 'none',
            'portability_required' => false,
            'description' => 'Email, browser tools, document generation, and basic office productivity.',
        ]);

        $fieldSales = RoleProfile::create([
            'name' => 'Field Sales Specialist',
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
            'description' => 'Client presentations, on-site travel, CRM management, video conferencing.',
        ]);

        $aiResearcher = RoleProfile::create([
            'name' => 'AI/ML Researcher',
            'min_cpu_tier' => 'workstation',
            'min_ram_gb' => 64,
            'min_storage_gb' => 2048,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-high',
            'portability_required' => false,
            'description' => 'Local LLM fine-tuning, PyTorch model training, and heavy CUDA workloads.',
        ]);

        // 3. Seed Devices (doc.md §12: 20-30 devices spanning all cpu_tier / gpu_tier)
        $devicesData = [
            // Laptops - High / Dedicated-High
            ['asset_tag' => 'LAP-001', 'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Pro 16 M3 Max', 'cpu' => 'Apple M3 Max 14-core', 'cpu_tier' => 'high', 'ram_gb' => 36, 'storage_type' => 'SSD', 'storage_gb' => 1024, 'gpu' => 'Apple 30-core GPU', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],
            ['asset_tag' => 'LAP-002', 'device_type' => 'laptop', 'brand' => 'Dell', 'model' => 'XPS 15 9530', 'cpu' => 'Intel Core i9-13900H', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024, 'gpu' => 'NVIDIA RTX 4070 Laptop', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],
            
            // Laptops - High / Integrated
            ['asset_tag' => 'LAP-003', 'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad T14s Gen 4', 'cpu' => 'AMD Ryzen 7 PRO 7840U', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'AMD Radeon 780M', 'gpu_tier' => 'integrated', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],
            ['asset_tag' => 'LAP-004', 'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Pro 14 M3 Pro', 'cpu' => 'Apple M3 Pro 11-core', 'cpu_tier' => 'high', 'ram_gb' => 18, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Apple 14-core GPU', 'gpu_tier' => 'dedicated-entry', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],

            // Laptops - Mid / Integrated
            ['asset_tag' => 'LAP-005', 'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad E14 Gen 5', 'cpu' => 'Intel Core i5-1335U', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],
            ['asset_tag' => 'LAP-006', 'device_type' => 'laptop', 'brand' => 'Dell', 'model' => 'Latitude 5440', 'cpu' => 'Intel Core i5-1345U', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],
            ['asset_tag' => 'LAP-007', 'device_type' => 'laptop', 'brand' => 'HP', 'model' => 'EliteBook 840 G10', 'cpu' => 'Intel Core i5-1350P', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],

            // Laptops - Entry / Integrated or None
            ['asset_tag' => 'LAP-008', 'device_type' => 'laptop', 'brand' => 'Acer', 'model' => 'Aspire 3', 'cpu' => 'Intel Core i3-1215U', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256, 'gpu' => 'Intel UHD Graphics', 'gpu_tier' => 'integrated', 'year_acquired' => 2022, 'condition' => 'good', 'status' => 'available'],
            ['asset_tag' => 'LAP-009', 'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'IdeaPad 1', 'cpu' => 'Intel Celeron N4020', 'cpu_tier' => 'entry', 'ram_gb' => 4, 'storage_type' => 'SSD', 'storage_gb' => 128, 'gpu' => 'Intel UHD 600', 'gpu_tier' => 'none', 'year_acquired' => 2021, 'condition' => 'fair', 'status' => 'available'],
            ['asset_tag' => 'LAP-010', 'device_type' => 'laptop', 'brand' => 'HP', 'model' => '250 G8', 'cpu' => 'Intel Core i3-1115G4', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256, 'gpu' => 'Intel UHD', 'gpu_tier' => 'none', 'year_acquired' => 2022, 'condition' => 'fair', 'status' => 'available'],

            // Desktops - Workstation / Dedicated-High
            ['asset_tag' => 'DSK-001', 'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'Precision 7960 Tower', 'cpu' => 'Intel Xeon w9-3495X', 'cpu_tier' => 'workstation', 'ram_gb' => 128, 'storage_type' => 'SSD', 'storage_gb' => 4096, 'gpu' => 'NVIDIA RTX 6000 Ada 48GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],
            ['asset_tag' => 'DSK-002', 'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'Z8 G5 Workstation', 'cpu' => 'Intel Xeon w7-2495X', 'cpu_tier' => 'workstation', 'ram_gb' => 64, 'storage_type' => 'SSD', 'storage_gb' => 2048, 'gpu' => 'NVIDIA RTX 4500 Ada 24GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],
            ['asset_tag' => 'DSK-003', 'device_type' => 'desktop', 'brand' => 'Custom', 'model' => 'AI Studio Rig', 'cpu' => 'AMD Threadripper 7970X', 'cpu_tier' => 'workstation', 'ram_gb' => 64, 'storage_type' => 'SSD', 'storage_gb' => 2048, 'gpu' => 'NVIDIA RTX 4090 24GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024, 'condition' => 'excellent', 'status' => 'available'],

            // Desktops - High / Dedicated-Entry or Integrated
            ['asset_tag' => 'DSK-004', 'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 7010 Tower', 'cpu' => 'Intel Core i7-13700', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024, 'gpu' => 'NVIDIA GTX 1650 4GB', 'gpu_tier' => 'dedicated-entry', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],
            ['asset_tag' => 'DSK-005', 'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'ProDesk 600 G9', 'cpu' => 'Intel Core i7-13700', 'cpu_tier' => 'high', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel UHD 770', 'gpu_tier' => 'integrated', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],

            // Desktops - Mid / Integrated
            ['asset_tag' => 'DSK-006', 'device_type' => 'desktop', 'brand' => 'Lenovo', 'model' => 'ThinkCentre M70q Tiny', 'cpu' => 'Intel Core i5-13400T', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel UHD 730', 'gpu_tier' => 'integrated', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],
            ['asset_tag' => 'DSK-007', 'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 3000 Micro', 'cpu' => 'Intel Core i5-12500T', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel UHD 770', 'gpu_tier' => 'integrated', 'year_acquired' => 2023, 'condition' => 'good', 'status' => 'available'],
            ['asset_tag' => 'DSK-008', 'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'EliteDesk 800 G6', 'cpu' => 'Intel Core i5-10500', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512, 'gpu' => 'Intel UHD 630', 'gpu_tier' => 'integrated', 'year_acquired' => 2021, 'condition' => 'fair', 'status' => 'available'],

            // Desktops - Entry / None
            ['asset_tag' => 'DSK-009', 'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 3080', 'cpu' => 'Intel Core i3-10100', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'HDD', 'storage_gb' => 1000, 'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2020, 'condition' => 'fair', 'status' => 'available'],
            ['asset_tag' => 'DSK-010', 'device_type' => 'desktop', 'brand' => 'Lenovo', 'model' => 'ThinkCentre M720s', 'cpu' => 'Intel Core i3-9100', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256, 'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2020, 'condition' => 'fair', 'status' => 'available'],

            // Special statuses
            ['asset_tag' => 'LAP-011', 'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Air M1', 'cpu' => 'Apple M1 8-core', 'cpu_tier' => 'mid', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256, 'gpu' => 'Apple 7-core GPU', 'gpu_tier' => 'integrated', 'year_acquired' => 2021, 'condition' => 'needs_repair', 'status' => 'in_repair', 'notes' => 'Swollen battery replacement pending.'],
            ['asset_tag' => 'DSK-011', 'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'Compaq 8200 Elite', 'cpu' => 'Intel Core i5-2400', 'cpu_tier' => 'entry', 'ram_gb' => 4, 'storage_type' => 'HDD', 'storage_gb' => 500, 'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2014, 'condition' => 'retired', 'status' => 'retired', 'notes' => 'End of lifecycle. Decommissioned.'],
        ];

        $devices = [];
        foreach ($devicesData as $data) {
            $devices[$data['asset_tag']] = Device::create($data);
        }

        // 4. Seed Employees (doc.md §12: 10-15 employees)
        $employeesData = [
            // Software Engineers (matched well)
            ['name' => 'Alice Chen', 'department' => 'Engineering', 'role_profile_id' => $softwareEngineer->id],
            ['name' => 'Brian Miller', 'department' => 'Engineering', 'role_profile_id' => $softwareEngineer->id],
            
            // Video / Creative (will test mismatch #1)
            ['name' => 'Carla Diaz', 'department' => 'Creative & Marketing', 'role_profile_id' => $videoEditor->id],
            ['name' => 'David Kim', 'department' => 'Creative & Marketing', 'role_profile_id' => $videoEditor->id],

            // Data Analysts (matched well)
            ['name' => 'Elena Rostova', 'department' => 'Business Intelligence', 'role_profile_id' => $dataAnalyst->id],
            ['name' => 'Farhan Qureshi', 'department' => 'Business Intelligence', 'role_profile_id' => $dataAnalyst->id],

            // Admin Staff (will test mismatch #2: over-provisioned with workstation GPU)
            ['name' => 'Grace Hopper', 'department' => 'Operations', 'role_profile_id' => $adminStaff->id],
            ['name' => 'Henry Adams', 'department' => 'Human Resources', 'role_profile_id' => $adminStaff->id],

            // Field Sales (will test mismatch #3: assigned a heavy desktop!)
            ['name' => 'Isabella Gomez', 'department' => 'Sales', 'role_profile_id' => $fieldSales->id],
            ['name' => 'Jack Torres', 'department' => 'Sales', 'role_profile_id' => $fieldSales->id],

            // AI Researcher (idle / awaiting assignment)
            ['name' => 'Dr. Karen Vance', 'department' => 'R&D', 'role_profile_id' => $aiResearcher->id],
            ['name' => 'Lucas Scott', 'department' => 'Engineering', 'role_profile_id' => null],
        ];

        $employees = [];
        foreach ($employeesData as $data) {
            $emp = Employee::create($data);
            $employees[$emp->name] = $emp;
        }

        // 5. Seed Active Assignments (including 3 intentional mismatches for contest demo)

        // Good match 1: Alice Chen (SWE) -> LAP-003 (ThinkPad T14s: high CPU, 32GB RAM, laptop)
        $this->createAssignment($devices['LAP-003'], $employees['Alice Chen'], 'ai_recommended', 0.94);

        // Good match 2: Brian Miller (SWE) -> LAP-004 (MacBook Pro 14: high CPU, 18GB RAM, laptop)
        $this->createAssignment($devices['LAP-004'], $employees['Brian Miller'], 'ai_recommended', 0.92);

        // Good match 3: Elena Rostova (Data Analyst) -> DSK-006 (ThinkCentre M70q: mid CPU, 16GB RAM, desktop)
        $this->createAssignment($devices['DSK-006'], $employees['Elena Rostova'], 'manual_override', 0.96);

        // Good match 4: Henry Adams (Admin) -> DSK-010 (ThinkCentre M720s: entry CPU, 8GB RAM, desktop)
        $this->createAssignment($devices['DSK-010'], $employees['Henry Adams'], 'manual_override', 0.98);

        // Good match 5: Jack Torres (Sales) -> LAP-006 (Dell Latitude 5440: mid CPU, 16GB, laptop)
        $this->createAssignment($devices['LAP-006'], $employees['Jack Torres'], 'ai_recommended', 0.95);

        // --- INTENTIONAL MISMATCH 1: Under-provisioned Video Editor ---
        // Carla Diaz (Video Editor: needs High CPU, 32GB RAM, dedicated GPU, laptop)
        // Assigned: LAP-008 (Acer Aspire: Entry CPU, 8GB RAM, integrated GPU) -> severely under-provisioned
        $this->createAssignment($devices['LAP-008'], $employees['Carla Diaz'], 'manual_override', 0.28);

        // --- INTENTIONAL MISMATCH 2: Over-provisioned Admin Staff ---
        // Grace Hopper (Admin Staff: needs Entry CPU, 8GB RAM, no GPU, desktop)
        // Assigned: DSK-001 (Precision 7960 Workstation with Xeon 128GB RAM & RTX 6000 Ada GPU!) -> gross fleet waste
        $this->createAssignment($devices['DSK-001'], $employees['Grace Hopper'], 'manual_override', 0.45);

        // --- INTENTIONAL MISMATCH 3: Immobility & under-spec mismatch for Field Sales ---
        // Isabella Gomez (Field Sales: requires laptop for travel and mid CPU)
        // Assigned: DSK-009 (Dell Desktop with HDD, entry CPU, no GPU) -> zero portability and under-spec
        $this->createAssignment($devices['DSK-009'], $employees['Isabella Gomez'], 'manual_override', 0.35);
    }

    private function createAssignment(Device $device, Employee $employee, string $source, float $score): void
    {
        Assignment::create([
            'device_id' => $device->id,
            'employee_id' => $employee->id,
            'assigned_at' => now()->subDays(rand(5, 60)),
            'unassigned_at' => null,
            'match_score' => $score,
            'assignment_source' => $source,
        ]);

        $device->update(['status' => 'assigned']);
    }
}
