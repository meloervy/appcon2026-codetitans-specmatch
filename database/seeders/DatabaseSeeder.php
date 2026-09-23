<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Device;
use App\Models\Employee;
use App\Models\LifecycleEvent;
use App\Models\RoleProfile;
use App\Models\User;
use App\Services\HardwareImageService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with Philippine enterprise ITAM data.
     */
    public function run(): void
    {
        // 1. Seed Enterprise ITAM Staff Users (Covering Admin, Asset Manager, and Technician)
        User::updateOrCreate(
            ['email' => 'admin@specmatch.local'],
            [
                'name' => 'IT Administrator',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'department' => 'IT Infrastructure & Systems',
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
                'email_verified_at' => now(),
            ]
        );

        // 2. Seed Role Profiles (Covering Core Engineering, UI/UX, Product Design, Analytics, & Admin)
        $developer = RoleProfile::create([
            'name' => 'Software Engineer',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
            'description' => 'Docker microservices, local compilation, IDEs, and full-stack software development.',
        ]);

        $uiuxDesigner = RoleProfile::create([
            'name' => 'UI/UX Designer',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
            'description' => 'Figma design systems, high-density prototyping, asset exports, and user research testing.',
        ]);

        $productDesigner = RoleProfile::create([
            'name' => 'Product Designer',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-entry',
            'portability_required' => true,
            'description' => 'Multi-platform product architecture, interactive 3D mockups, complex component libraries, and motion specs.',
        ]);

        $videoEditor = RoleProfile::create([
            'name' => 'Video & Motion Designer',
            'min_cpu_tier' => 'high',
            'min_ram_gb' => 32,
            'min_storage_gb' => 1024,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-high',
            'portability_required' => true,
            'description' => '4K video rendering, Adobe Premiere, After Effects, DaVinci Resolve, and color grading.',
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
            'description' => 'Email, ERP web apps, document generation, and basic office productivity.',
        ]);

        $fieldSales = RoleProfile::create([
            'name' => 'Field Sales Specialist',
            'min_cpu_tier' => 'mid',
            'min_ram_gb' => 16,
            'min_storage_gb' => 512,
            'requires_gpu' => false,
            'min_gpu_tier' => 'integrated',
            'portability_required' => true,
            'description' => 'Client presentations across Metro Manila, on-site travel, CRM management, video conferencing.',
        ]);

        $aiResearcher = RoleProfile::create([
            'name' => 'AI/ML Researcher',
            'min_cpu_tier' => 'workstation',
            'min_ram_gb' => 64,
            'min_storage_gb' => 2048,
            'requires_gpu' => true,
            'min_gpu_tier' => 'dedicated-high',
            'portability_required' => false,
            'description' => 'Local LLM fine-tuning, PyTorch model training, and heavy CUDA tensor workloads.',
        ]);

        // 3. Seed Devices with Greater Metro Manila Locations, Philippine Peso (₱) Costs, and Authentic Images
        $devicesData = [
            // Laptops - High / Dedicated-High
            [
                'asset_tag' => 'LAP-001', 'serial_number' => 'C02G45XP19F3', 'barcode' => 'BC-LAP-001', 'techspecs_id' => 'apple-macbook-pro-16-m3-max',
                'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Pro 16 M3 Max',
                'location' => 'BGC, Taguig City - Bonifacio High Street Hub, Level 15',
                'image_url' => HardwareImageService::resolveModelImage('Apple', 'MacBook Pro 16'),
                'cpu' => 'Apple M3 Max 14-core', 'cpu_tier' => 'high', 'ram_gb' => 36, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'Apple 30-core GPU', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 215000.00, 'purchase_date' => '2024-01-15', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Power Mac Center Corporate / Apple PH', 'warranty_start' => '2024-01-15', 'warranty_expiry' => '2027-01-15', 'contract_sla' => 'AppleCare+ for Enterprise (4h onsite)',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'LAP-002', 'serial_number' => '8F29KD3X', 'barcode' => 'BC-LAP-002', 'techspecs_id' => 'dell-xps-15-9530',
                'device_type' => 'laptop', 'brand' => 'Dell', 'model' => 'XPS 15 9530',
                'location' => 'Makati City - Ayala Triangle Tower One, Level 22',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'XPS 15'),
                'cpu' => 'Intel Core i9-13900H', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'NVIDIA RTX 4070 Laptop', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 155000.00, 'purchase_date' => '2024-02-10', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Dell Philippines Direct', 'warranty_start' => '2024-02-10', 'warranty_expiry' => '2027-02-10', 'contract_sla' => 'ProSupport Plus Mission Critical NBD',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Laptops - High / Integrated
            [
                'asset_tag' => 'LAP-003', 'serial_number' => 'PF49XQ11', 'barcode' => 'BC-LAP-003', 'techspecs_id' => 'lenovo-thinkpad-t14s-gen4',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad T14s Gen 4',
                'location' => 'Ortigas Center, Pasig City - Exchange Road Tech Center',
                'image_url' => HardwareImageService::resolveModelImage('Lenovo', 'ThinkPad T14s'),
                'cpu' => 'AMD Ryzen 7 PRO 7840U', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'AMD Radeon 780M', 'gpu_tier' => 'integrated', 'year_acquired' => 2024,
                'purchase_cost' => 98000.00, 'purchase_date' => '2024-03-01', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Lenovo Philippines Commercial Direct', 'warranty_start' => '2024-03-01', 'warranty_expiry' => '2027-03-01', 'contract_sla' => 'Premier Support NBD Onsite',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'LAP-004', 'serial_number' => 'H9Y21M89', 'barcode' => 'BC-LAP-004', 'techspecs_id' => 'apple-macbook-pro-14-m3-pro',
                'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Pro 14 M3 Pro',
                'location' => 'BGC, Taguig City - Bonifacio High Street Hub, Level 15',
                'image_url' => HardwareImageService::resolveModelImage('Apple', 'MacBook Pro 14'),
                'cpu' => 'Apple M3 Pro 11-core', 'cpu_tier' => 'high', 'ram_gb' => 18, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Apple 14-core GPU', 'gpu_tier' => 'dedicated-entry', 'year_acquired' => 2024,
                'purchase_cost' => 125000.00, 'purchase_date' => '2024-02-20', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Power Mac Center Corporate / Apple PH', 'warranty_start' => '2024-02-20', 'warranty_expiry' => '2027-02-20', 'contract_sla' => 'AppleCare+ for Enterprise',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Laptops - Mid / Integrated
            [
                'asset_tag' => 'LAP-005', 'serial_number' => 'PF32098K', 'barcode' => 'BC-LAP-005', 'techspecs_id' => 'lenovo-thinkpad-e14-gen5',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad E14 Gen 5',
                'location' => 'Quezon City - Eastwood Cyberpark Tower 3',
                'image_url' => HardwareImageService::resolveModelImage('Lenovo', 'ThinkPad E14'),
                'cpu' => 'Intel Core i5-1335U', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 56000.00, 'purchase_date' => '2023-05-12', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Silicon Valley / Lenovo Partner PH', 'warranty_start' => '2023-05-12', 'warranty_expiry' => '2026-05-12', 'contract_sla' => 'Standard Depot Repair',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'LAP-006', 'serial_number' => 'DL98124K', 'barcode' => 'BC-LAP-006', 'techspecs_id' => 'dell-latitude-5440',
                'device_type' => 'laptop', 'brand' => 'Dell', 'model' => 'Latitude 5440',
                'location' => 'Mandaluyong City - Pioneer Innovation Center',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'Latitude 5440'),
                'cpu' => 'Intel Core i5-1345U', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 68000.00, 'purchase_date' => '2023-06-18', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Dell Philippines Direct', 'warranty_start' => '2023-06-18', 'warranty_expiry' => '2026-06-18', 'contract_sla' => 'Dell ProSupport NBD',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'LAP-007', 'serial_number' => 'CND29481M', 'barcode' => 'BC-LAP-007', 'techspecs_id' => 'hp-elitebook-840-g10',
                'device_type' => 'laptop', 'brand' => 'HP', 'model' => 'EliteBook 840 G10',
                'location' => 'Makati City - Legaspi Village Design Studio',
                'image_url' => HardwareImageService::resolveModelImage('HP', 'EliteBook 840 G10'),
                'cpu' => 'Intel Core i5-1350P', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 74000.00, 'purchase_date' => '2023-07-04', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'HP Philippines Enterprise', 'warranty_start' => '2023-07-04', 'warranty_expiry' => '2026-10-15', 'contract_sla' => 'HP Care Pack Next Business Day',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Laptops - Entry / Integrated or None (Approaching Warranty Expiry)
            [
                'asset_tag' => 'LAP-008', 'serial_number' => 'NX83910A', 'barcode' => 'BC-LAP-008', 'techspecs_id' => 'acer-aspire-3',
                'device_type' => 'laptop', 'brand' => 'Acer', 'model' => 'Aspire 3',
                'location' => 'Pasay City - Mall of Asia Complex, E-Com Tower',
                'image_url' => HardwareImageService::resolveModelImage('Acer', 'Aspire 3'),
                'cpu' => 'Intel Core i3-1215U', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => 'Intel UHD Graphics', 'gpu_tier' => 'integrated', 'year_acquired' => 2022,
                'purchase_cost' => 28500.00, 'purchase_date' => '2022-08-10', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'VillMan Computers PH', 'warranty_start' => '2022-08-10', 'warranty_expiry' => now()->addDays(25)->toDateString(), 'contract_sla' => '1-Year Limited Warranty (Extended)',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'LAP-009', 'serial_number' => 'PF10928N', 'barcode' => 'BC-LAP-009', 'techspecs_id' => 'lenovo-ideapad-1',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'IdeaPad 1',
                'location' => 'Quezon City - UP-Ayala Technohub Hub 2',
                'image_url' => HardwareImageService::resolveModelImage('Lenovo', 'IdeaPad'),
                'cpu' => 'Intel Celeron N4020', 'cpu_tier' => 'entry', 'ram_gb' => 4, 'storage_type' => 'SSD', 'storage_gb' => 128,
                'gpu' => 'Intel UHD 600', 'gpu_tier' => 'none', 'year_acquired' => 2021,
                'purchase_cost' => 18500.00, 'purchase_date' => '2021-04-12', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'PC Express Commercial', 'warranty_start' => '2021-04-12', 'warranty_expiry' => '2023-04-12', 'contract_sla' => 'Standard Return Only',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'LAP-010', 'serial_number' => '5CD19283X', 'barcode' => 'BC-LAP-010', 'techspecs_id' => 'hp-250-g8',
                'device_type' => 'laptop', 'brand' => 'HP', 'model' => '250 G8',
                'location' => 'Alabang, Muntinlupa - Filinvest Corporate City Level 5',
                'image_url' => HardwareImageService::resolveModelImage('HP', '250 G8'),
                'cpu' => 'Intel Core i3-1115G4', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => 'Intel UHD', 'gpu_tier' => 'none', 'year_acquired' => 2022,
                'purchase_cost' => 26000.00, 'purchase_date' => '2022-09-01', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Octagon Computer Superstore', 'warranty_start' => '2022-09-01', 'warranty_expiry' => now()->addDays(45)->toDateString(), 'contract_sla' => 'HP Base Hardware Support',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Desktops - Workstation / Dedicated-High
            [
                'asset_tag' => 'DSK-001', 'serial_number' => 'DPREC-9821-X', 'barcode' => 'BC-DSK-001', 'techspecs_id' => 'dell-precision-7960-tower',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'Precision 7960 Tower',
                'location' => 'BGC, Taguig City - Level 14 Tech Hub / Data Lab',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'Precision 7960 Tower', 'desktop'),
                'cpu' => 'Intel Xeon w9-3495X', 'cpu_tier' => 'workstation', 'ram_gb' => 128, 'storage_type' => 'SSD', 'storage_gb' => 4096,
                'gpu' => 'NVIDIA RTX 6000 Ada 48GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 540000.00, 'purchase_date' => '2024-01-20', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Dell Philippines Direct Enterprise', 'warranty_start' => '2024-01-20', 'warranty_expiry' => '2029-01-20', 'contract_sla' => 'Mission Critical 24x7 4-Hour Response',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'DSK-002', 'serial_number' => 'HPZ8-1928-W', 'barcode' => 'BC-DSK-002', 'techspecs_id' => 'hp-z8-g5-workstation',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'Z8 G5 Workstation',
                'location' => 'Makati City - Ayala Triangle Tower One, Level 22',
                'image_url' => HardwareImageService::resolveModelImage('HP', 'Z8 G5 Workstation', 'desktop'),
                'cpu' => 'Intel Xeon w7-2495X', 'cpu_tier' => 'workstation', 'ram_gb' => 64, 'storage_type' => 'SSD', 'storage_gb' => 2048,
                'gpu' => 'NVIDIA RTX 4500 Ada 24GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 380000.00, 'purchase_date' => '2024-02-05', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'HP Philippines Enterprise', 'warranty_start' => '2024-02-05', 'warranty_expiry' => '2029-02-05', 'contract_sla' => 'HP 5-Year Next Business Day Onsite',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'DSK-003', 'serial_number' => 'RIG-TR-7970-01', 'barcode' => 'BC-DSK-003', 'techspecs_id' => 'custom-ai-studio-rig',
                'device_type' => 'desktop', 'brand' => 'Custom', 'model' => 'AI Studio Rig',
                'location' => 'Ortigas Center, Pasig City - Exchange Road Suite 802',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'Precision', 'desktop'),
                'cpu' => 'AMD Threadripper 7970X', 'cpu_tier' => 'workstation', 'ram_gb' => 64, 'storage_type' => 'SSD', 'storage_gb' => 2048,
                'gpu' => 'NVIDIA RTX 4090 24GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 325000.00, 'purchase_date' => '2024-03-10', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'DynaQuest PC Enterprise Manila', 'warranty_start' => '2024-03-10', 'warranty_expiry' => '2027-03-10', 'contract_sla' => 'Parts & Labor 3-Year Coverage',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Desktops - High / Dedicated-Entry or Integrated
            [
                'asset_tag' => 'DSK-004', 'serial_number' => 'OPTI-7010-891', 'barcode' => 'BC-DSK-004', 'techspecs_id' => 'dell-optiplex-7010-tower',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 7010 Tower',
                'location' => 'Quezon City - Eastwood Cyberpark Tower 3',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'OptiPlex 7010', 'desktop'),
                'cpu' => 'Intel Core i7-13700', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'NVIDIA GTX 1650 4GB', 'gpu_tier' => 'dedicated-entry', 'year_acquired' => 2023,
                'purchase_cost' => 82000.00, 'purchase_date' => '2023-04-15', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Dell Philippines Direct', 'warranty_start' => '2023-04-15', 'warranty_expiry' => '2026-04-15', 'contract_sla' => 'Dell ProSupport NBD',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'DSK-005', 'serial_number' => 'PD-600G9-3829', 'barcode' => 'BC-DSK-005', 'techspecs_id' => 'hp-prodesk-600-g9',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'ProDesk 600 G9',
                'location' => 'Mandaluyong City - Pioneer Innovation Center',
                'image_url' => HardwareImageService::resolveModelImage('HP', 'ProDesk 600 G9', 'desktop'),
                'cpu' => 'Intel Core i7-13700', 'cpu_tier' => 'high', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 770', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 65000.00, 'purchase_date' => '2023-05-20', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'HP Philippines Enterprise', 'warranty_start' => '2023-05-20', 'warranty_expiry' => '2026-05-20', 'contract_sla' => 'HP Care Pack Next Business Day',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Desktops - Mid / Integrated
            [
                'asset_tag' => 'DSK-006', 'serial_number' => 'TC-M70Q-9182', 'barcode' => 'BC-DSK-006', 'techspecs_id' => 'lenovo-thinkcentre-m70q-gen4',
                'device_type' => 'desktop', 'brand' => 'Lenovo', 'model' => 'ThinkCentre M70q Tiny',
                'location' => 'Alabang, Muntinlupa - Filinvest Corporate City Level 5',
                'image_url' => HardwareImageService::resolveModelImage('Lenovo', 'ThinkCentre M70q', 'desktop'),
                'cpu' => 'Intel Core i5-13400T', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 730', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 51000.00, 'purchase_date' => '2023-06-10', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Lenovo Philippines Commercial', 'warranty_start' => '2023-06-10', 'warranty_expiry' => '2026-06-10', 'contract_sla' => 'Lenovo Premier NBD',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'DSK-007', 'serial_number' => 'OPTI-3000-471', 'barcode' => 'BC-DSK-007', 'techspecs_id' => 'dell-optiplex-3000-micro',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 3000 Micro',
                'location' => 'Pasay City - Mall of Asia Complex, E-Com Tower',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'OptiPlex 3000 Micro', 'desktop'),
                'cpu' => 'Intel Core i5-12500T', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 770', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 49000.00, 'purchase_date' => '2023-07-15', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Dell Philippines Direct', 'warranty_start' => '2023-07-15', 'warranty_expiry' => '2026-07-15', 'contract_sla' => 'Standard NBD Onsite',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'DSK-008', 'serial_number' => 'ED-800G6-1192', 'barcode' => 'BC-DSK-008', 'techspecs_id' => 'hp-elitedesk-800-g6',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'EliteDesk 800 G6',
                'location' => 'Makati City - Legaspi Village Operations',
                'image_url' => HardwareImageService::resolveModelImage('HP', 'EliteDesk', 'desktop'),
                'cpu' => 'Intel Core i5-10500', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 630', 'gpu_tier' => 'integrated', 'year_acquired' => 2021,
                'purchase_cost' => 52000.00, 'purchase_date' => '2021-03-20', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'HP Philippines Enterprise', 'warranty_start' => '2021-03-20', 'warranty_expiry' => '2024-03-20', 'contract_sla' => 'Expired',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Desktops - Entry / None
            [
                'asset_tag' => 'DSK-009', 'serial_number' => 'OPTI-3080-293', 'barcode' => 'BC-DSK-009', 'techspecs_id' => 'dell-optiplex-3080',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 3080',
                'location' => 'Taguig City - McKinley Hill Depot',
                'image_url' => HardwareImageService::resolveModelImage('Dell', 'OptiPlex 3080', 'desktop'),
                'cpu' => 'Intel Core i3-10100', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'HDD', 'storage_gb' => 1000,
                'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2020,
                'purchase_cost' => 35000.00, 'purchase_date' => '2020-05-10', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Dell Philippines Direct', 'warranty_start' => '2020-05-10', 'warranty_expiry' => '2023-05-10', 'contract_sla' => 'Expired',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],
            [
                'asset_tag' => 'DSK-010', 'serial_number' => 'TC-M720S-048', 'barcode' => 'BC-DSK-010', 'techspecs_id' => 'lenovo-thinkcentre-m720s',
                'device_type' => 'desktop', 'brand' => 'Lenovo', 'model' => 'ThinkCentre M720s',
                'location' => 'BGC, Taguig City - Reception Hub Desk',
                'image_url' => HardwareImageService::resolveModelImage('Lenovo', 'ThinkCentre M720s', 'desktop'),
                'cpu' => 'Intel Core i3-9100', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2020,
                'purchase_cost' => 34000.00, 'purchase_date' => '2020-08-14', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'PC Express Commercial', 'warranty_start' => '2020-08-14', 'warranty_expiry' => '2023-08-14', 'contract_sla' => 'Expired',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment',
            ],

            // Active In-Maintenance & Retired Lifecycle Assets
            [
                'asset_tag' => 'LAP-011', 'serial_number' => 'C02F23KLMD6R', 'barcode' => 'BC-LAP-011', 'techspecs_id' => 'apple-macbook-air-m1',
                'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Air M1',
                'location' => 'IT Repair Bench - Makati Staging Depot (Desk 3)',
                'image_url' => HardwareImageService::resolveModelImage('Apple', 'MacBook Air M1'),
                'cpu' => 'Apple M1 8-core', 'cpu_tier' => 'mid', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => 'Apple 7-core GPU', 'gpu_tier' => 'integrated', 'year_acquired' => 2021,
                'purchase_cost' => 58000.00, 'purchase_date' => '2021-11-18', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Beyond the Box / Apple Premium Reseller PH', 'warranty_start' => '2021-11-18', 'warranty_expiry' => '2024-11-18', 'contract_sla' => 'AppleCare+ Expired',
                'condition' => 'needs_repair', 'status' => 'in_repair', 'lifecycle_stage' => 'maintenance',
                'notes' => 'Swollen battery replacement and trackpad recalibration in progress.',
            ],
            [
                'asset_tag' => 'DSK-011', 'serial_number' => 'CQ-8200-LEGACY', 'barcode' => 'BC-DSK-011', 'techspecs_id' => 'hp-compaq-8200-elite',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'Compaq 8200 Elite',
                'location' => 'Pasig City - Decommissioning Depot (Basement)',
                'image_url' => HardwareImageService::resolveModelImage('HP', 'Compaq', 'desktop'),
                'cpu' => 'Intel Core i5-2400', 'cpu_tier' => 'entry', 'ram_gb' => 4, 'storage_type' => 'HDD', 'storage_gb' => 500,
                'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2014,
                'purchase_cost' => 42000.00, 'purchase_date' => '2014-06-12', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Legacy Hardware Vendor Manila', 'warranty_start' => '2014-06-12', 'warranty_expiry' => '2017-06-12', 'contract_sla' => 'Decommissioned',
                'condition' => 'retired', 'status' => 'retired', 'lifecycle_stage' => 'retirement',
                'notes' => 'End of 10-year lifecycle. Hard drives wiped via NIST 800-88 standard. Awaiting electronic recycling.',
            ],

            // Newly Acquired Asset in Staging
            [
                'asset_tag' => 'LAP-012', 'serial_number' => 'PF5420MN', 'barcode' => 'BC-LAP-012', 'techspecs_id' => 'lenovo-thinkpad-x1-carbon-gen11',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad X1 Carbon Gen 11',
                'location' => 'BGC, Taguig City - IT Staging & Procurement Depot',
                'image_url' => HardwareImageService::resolveModelImage('Lenovo', 'ThinkPad X1 Carbon'),
                'cpu' => 'Intel Core i7-1365U', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2024,
                'purchase_cost' => 128000.00, 'purchase_date' => now()->subDays(3)->toDateString(), 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Lenovo Philippines Commercial', 'warranty_start' => now()->subDays(3)->toDateString(), 'warranty_expiry' => now()->addYears(3)->toDateString(), 'contract_sla' => 'Premier Support Plus 3-Yr',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'acquisition',
                'notes' => 'Newly arrived from vendor. Staging corporate image, disk encryption, and asset tags.',
            ],
        ];

        $devices = [];
        $adminUser = User::where('email', 'admin@specmatch.local')->first();

        foreach ($devicesData as $data) {
            $device = Device::create($data);
            $devices[$data['asset_tag']] = $device;

            // Seed initial lifecycle audit record
            LifecycleEvent::create([
                'device_id' => $device->id,
                'from_stage' => 'new',
                'to_stage' => $device->lifecycle_stage,
                'changed_by_user_id' => $adminUser?->id,
                'notes' => "Asset {$device->asset_tag} onboarded in {$device->lifecycle_stage} stage.",
            ]);
        }

        // Seed Sample Maintenance Activities (with Philippine Peso ₱ costs)
        // 1. In-progress battery repair for LAP-011
        $devices['LAP-011']->maintenanceLogs()->create([
            'type' => 'repair',
            'title' => 'OEM Battery Replacement & Thermal Paste',
            'description' => 'Swollen battery detected during physical audit. Unit taken off deployment. OEM battery replacement ordered and undergoing installation at Greenhills Authorized Center.',
            'cost' => 7500.00,
            'performed_by' => 'Beyond the Box Service Center / Mark Ramos',
            'started_at' => now()->subDays(2),
            'completed_at' => null,
            'performance_assessment' => null,
            'status' => 'in_progress',
        ]);

        // 2. Completed Hardware Upgrade for LAP-002
        $devices['LAP-002']->maintenanceLogs()->create([
            'type' => 'upgrade',
            'title' => 'RAM Upgrade 16GB -> 32GB DDR5 & NVMe Speed Validation',
            'description' => 'Upgraded memory modules to Corsair Vengeance 32GB DDR5 5200MHz for intensive compiling and local container tasks.',
            'cost' => 9200.00,
            'performed_by' => 'Internal IT Team - Ortigas Hub',
            'started_at' => now()->subDays(45),
            'completed_at' => now()->subDays(44),
            'performance_assessment' => 'Memory bandwidth increased by 38%. PassMark memory benchmark score improved from 2,890 to 3,640. Zero crash logs observed post-burn-in test.',
            'status' => 'completed',
        ]);

        // 3. Completed Preventive Servicing for DSK-001 Workstation
        $devices['DSK-001']->maintenanceLogs()->create([
            'type' => 'preventive',
            'title' => 'Quarterly Dust Cleanout & Liquid Cooling Loop Pressure Check',
            'description' => 'Complete air filter dust purging, liquid radiator inspection, and thermal baseline verification under full AVX-512 compute load.',
            'cost' => 4500.00,
            'performed_by' => 'Dell Enterprise Hardware Specialist Manila',
            'started_at' => now()->subDays(20),
            'completed_at' => now()->subDays(20),
            'performance_assessment' => 'Peak temperatures under full GPU render benchmark dropped by 7.2 degrees Celsius (84°C -> 76.8°C). Fan acoustical profile normalized.',
            'status' => 'completed',
        ]);

        // 4. Scheduled Inspection for DSK-002
        $devices['DSK-002']->maintenanceLogs()->create([
            'type' => 'inspection',
            'title' => 'Annual Power Supply & UPS Load Balancing Inspection',
            'description' => 'Verify secondary 1400W redundant power supply failover and voltage stabilization under maximum CUDA tensor core utilization.',
            'cost' => 3000.00,
            'performed_by' => 'Schneider Electric / APC Certified Tech',
            'started_at' => now()->addDays(5),
            'completed_at' => null,
            'performance_assessment' => null,
            'status' => 'scheduled',
        ]);

        // 4. Seed Employees: Featuring Real Team Members & Authentic Filipino Names
        $employeesData = [
            // Core Team Members (Real Names requested by user)
            ['name' => 'Aaron Creed Celindro', 'department' => 'Engineering', 'role_profile_id' => $developer->id],
            ['name' => 'Alwyn Adriano', 'department' => 'Engineering', 'role_profile_id' => $developer->id],
            ['name' => 'Kent Joshua A. Olimberio', 'department' => 'UI/UX Design', 'role_profile_id' => $uiuxDesigner->id],
            ['name' => 'Melo Ervy Garcia', 'department' => 'Product Design', 'role_profile_id' => $productDesigner->id],

            // Video / Creative (Intentional Mismatch #1)
            ['name' => 'Bianca Nicole Reyes', 'department' => 'Creative & Marketing', 'role_profile_id' => $videoEditor->id],

            // Administrative Staff (Intentional Mismatch #2)
            ['name' => 'Maria Clara Santos', 'department' => 'Operations', 'role_profile_id' => $adminStaff->id],

            // Field Sales (Intentional Mismatch #3)
            ['name' => 'Juan Paolo Dela Cruz', 'department' => 'Sales', 'role_profile_id' => $fieldSales->id],

            // Data Analysts & Support Staff
            ['name' => 'Patricia Anne Mendoza', 'department' => 'Business Intelligence', 'role_profile_id' => $dataAnalyst->id],
            ['name' => 'Kimberly Mae Flores', 'department' => 'Human Resources', 'role_profile_id' => $adminStaff->id],
            ['name' => 'Angelo Miguel Ramos', 'department' => 'Sales', 'role_profile_id' => $fieldSales->id],

            // AI Researcher (awaiting assignment)
            ['name' => 'Dr. Christian Dave Bautista', 'department' => 'R&D', 'role_profile_id' => $aiResearcher->id],
            ['name' => 'Joshua Emmanuel Castro', 'department' => 'Engineering', 'role_profile_id' => null],
        ];

        $employees = [];
        foreach ($employeesData as $data) {
            $emp = Employee::create($data);
            $employees[$emp->name] = $emp;
        }

        // 5. Seed Active Assignments
        // Team Member Assignments (High match fit with verified high-performance machines)
        // 1. Aaron Creed Celindro (Developer) -> LAP-003 (ThinkPad T14s: high CPU, 32GB RAM, laptop)
        $this->createAssignment($devices['LAP-003'], $employees['Aaron Creed Celindro'], 'ai_recommended', 0.94);

        // 2. Alwyn Adriano (Developer) -> LAP-002 (Dell XPS 15 9530: i9, 32GB RAM, RTX 4070)
        $this->createAssignment($devices['LAP-002'], $employees['Alwyn Adriano'], 'ai_recommended', 0.95);

        // 3. Kent Joshua A. Olimberio (UI/UX) -> LAP-004 (MacBook Pro 14 M3 Pro: 18GB RAM, Retina)
        $this->createAssignment($devices['LAP-004'], $employees['Kent Joshua A. Olimberio'], 'ai_recommended', 0.93);

        // 4. Melo Ervy Garcia (Product Designer) -> LAP-001 (MacBook Pro 16 M3 Max: 36GB RAM, 30-core GPU)
        $this->createAssignment($devices['LAP-001'], $employees['Melo Ervy Garcia'], 'ai_recommended', 0.96);

        // Other well-matched assignments
        // 5. Patricia Anne Mendoza (Data Analyst) -> DSK-006 (ThinkCentre M70q Tiny: mid CPU, 16GB RAM, desktop)
        $this->createAssignment($devices['DSK-006'], $employees['Patricia Anne Mendoza'], 'manual_override', 0.96);

        // 6. Kimberly Mae Flores (Admin) -> DSK-010 (ThinkCentre M720s: entry CPU, 8GB RAM, desktop)
        $this->createAssignment($devices['DSK-010'], $employees['Kimberly Mae Flores'], 'manual_override', 0.98);

        // 7. Angelo Miguel Ramos (Sales) -> LAP-006 (Dell Latitude 5440: mid CPU, 16GB, laptop)
        $this->createAssignment($devices['LAP-006'], $employees['Angelo Miguel Ramos'], 'ai_recommended', 0.95);

        // --- INTENTIONAL MISMATCH 1: Under-provisioned Video & Motion Designer ---
        // Bianca Nicole Reyes (Video Editor: needs High CPU, 32GB RAM, dedicated GPU, laptop)
        // Assigned: LAP-008 (Acer Aspire: Entry CPU, 8GB RAM, integrated GPU) -> severely under-provisioned
        $this->createAssignment($devices['LAP-008'], $employees['Bianca Nicole Reyes'], 'manual_override', 0.28);

        // --- INTENTIONAL MISMATCH 2: Over-provisioned Admin Staff ---
        // Maria Clara Santos (Admin Staff: needs Entry CPU, 8GB RAM, no GPU, desktop)
        // Assigned: DSK-001 (Precision 7960 Workstation with Xeon 128GB RAM & RTX 6000 Ada GPU!) -> gross fleet waste
        $this->createAssignment($devices['DSK-001'], $employees['Maria Clara Santos'], 'manual_override', 0.45);

        // --- INTENTIONAL MISMATCH 3: Immobility & under-spec mismatch for Field Sales ---
        // Juan Paolo Dela Cruz (Field Sales: requires laptop for Metro Manila travel and mid CPU)
        // Assigned: DSK-009 (Dell Desktop with HDD, entry CPU, no GPU) -> zero portability and under-spec
        $this->createAssignment($devices['DSK-009'], $employees['Juan Paolo Dela Cruz'], 'manual_override', 0.35);
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
