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

        // 3. Seed Devices with comprehensive ITAM Tracking & Lifecycle Data
        $devicesData = [
            // Laptops - High / Dedicated-High
            [
                'asset_tag' => 'LAP-001', 'serial_number' => 'C02G45XP19F3', 'barcode' => 'BC-LAP-001', 'techspecs_id' => 'apple-macbook-pro-16-m3-max',
                'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Pro 16 M3 Max',
                'location' => 'HQ - Innovation Hub (Level 4)',
                'cpu' => 'Apple M3 Max 14-core', 'cpu_tier' => 'high', 'ram_gb' => 36, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'Apple 30-core GPU', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 3499.00, 'purchase_date' => '2024-01-15', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Apple Enterprise Direct', 'warranty_start' => '2024-01-15', 'warranty_expiry' => '2027-01-15', 'contract_sla' => 'AppleCare+ for Enterprise (4h onsite)',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'LAP-002', 'serial_number' => '8F29KD3X', 'barcode' => 'BC-LAP-002', 'techspecs_id' => 'dell-xps-15-9530',
                'device_type' => 'laptop', 'brand' => 'Dell', 'model' => 'XPS 15 9530',
                'location' => 'HQ - Software Eng Pod A',
                'cpu' => 'Intel Core i9-13900H', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'NVIDIA RTX 4070 Laptop', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 2499.00, 'purchase_date' => '2024-02-10', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Dell Commercial Direct', 'warranty_start' => '2024-02-10', 'warranty_expiry' => '2027-02-10', 'contract_sla' => 'ProSupport Plus Mission Critical',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            
            // Laptops - High / Integrated
            [
                'asset_tag' => 'LAP-003', 'serial_number' => 'PF49XQ11', 'barcode' => 'BC-LAP-003', 'techspecs_id' => 'lenovo-thinkpad-t14s-gen4',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad T14s Gen 4',
                'location' => 'HQ - Software Eng Pod B',
                'cpu' => 'AMD Ryzen 7 PRO 7840U', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'AMD Radeon 780M', 'gpu_tier' => 'integrated', 'year_acquired' => 2024,
                'purchase_cost' => 1650.00, 'purchase_date' => '2024-03-01', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Lenovo Premier Support', 'warranty_start' => '2024-03-01', 'warranty_expiry' => '2027-03-01', 'contract_sla' => 'Premier Support NBD Onsite',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'LAP-004', 'serial_number' => 'H9Y21M89', 'barcode' => 'BC-LAP-004', 'techspecs_id' => 'apple-macbook-pro-14-m3-pro',
                'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Pro 14 M3 Pro',
                'location' => 'HQ - Creative Suite',
                'cpu' => 'Apple M3 Pro 11-core', 'cpu_tier' => 'high', 'ram_gb' => 18, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Apple 14-core GPU', 'gpu_tier' => 'dedicated-entry', 'year_acquired' => 2024,
                'purchase_cost' => 1999.00, 'purchase_date' => '2024-02-20', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Apple Enterprise Direct', 'warranty_start' => '2024-02-20', 'warranty_expiry' => '2027-02-20', 'contract_sla' => 'AppleCare+ for Enterprise',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Laptops - Mid / Integrated
            [
                'asset_tag' => 'LAP-005', 'serial_number' => 'PF32098K', 'barcode' => 'BC-LAP-005', 'techspecs_id' => 'lenovo-thinkpad-e14-gen5',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad E14 Gen 5',
                'location' => 'HQ - Operations Floor',
                'cpu' => 'Intel Core i5-1335U', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 950.00, 'purchase_date' => '2023-05-12', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'CDW IT Solutions', 'warranty_start' => '2023-05-12', 'warranty_expiry' => '2026-05-12', 'contract_sla' => 'Standard Depo Repair',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'LAP-006', 'serial_number' => 'DL98124K', 'barcode' => 'BC-LAP-006', 'techspecs_id' => 'dell-latitude-5440',
                'device_type' => 'laptop', 'brand' => 'Dell', 'model' => 'Latitude 5440',
                'location' => 'HQ - Sales Department',
                'cpu' => 'Intel Core i5-1345U', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 1150.00, 'purchase_date' => '2023-06-18', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Dell Commercial Direct', 'warranty_start' => '2023-06-18', 'warranty_expiry' => '2026-06-18', 'contract_sla' => 'Dell ProSupport NBD',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'LAP-007', 'serial_number' => 'CND29481M', 'barcode' => 'BC-LAP-007', 'techspecs_id' => 'hp-elitebook-840-g10',
                'device_type' => 'laptop', 'brand' => 'HP', 'model' => 'EliteBook 840 G10',
                'location' => 'HQ - Finance Dept',
                'cpu' => 'Intel Core i5-1350P', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 1250.00, 'purchase_date' => '2023-07-04', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'HP Enterprise Care', 'warranty_start' => '2023-07-04', 'warranty_expiry' => '2026-10-15', 'contract_sla' => 'HP Care Pack Next Business Day',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Laptops - Entry / Integrated or None (Approaching Warranty Expiry)
            [
                'asset_tag' => 'LAP-008', 'serial_number' => 'NX83910A', 'barcode' => 'BC-LAP-008', 'techspecs_id' => 'acer-aspire-3',
                'device_type' => 'laptop', 'brand' => 'Acer', 'model' => 'Aspire 3',
                'location' => 'HQ - Annex 2',
                'cpu' => 'Intel Core i3-1215U', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => 'Intel UHD Graphics', 'gpu_tier' => 'integrated', 'year_acquired' => 2022,
                'purchase_cost' => 499.00, 'purchase_date' => '2022-08-10', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Insight Direct', 'warranty_start' => '2022-08-10', 'warranty_expiry' => now()->addDays(25)->toDateString(), 'contract_sla' => '1-Year Limited Warranty (Extended)',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'LAP-009', 'serial_number' => 'PF10928N', 'barcode' => 'BC-LAP-009', 'techspecs_id' => 'lenovo-ideapad-1',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'IdeaPad 1',
                'location' => 'HQ - Training Room B',
                'cpu' => 'Intel Celeron N4020', 'cpu_tier' => 'entry', 'ram_gb' => 4, 'storage_type' => 'SSD', 'storage_gb' => 128,
                'gpu' => 'Intel UHD 600', 'gpu_tier' => 'none', 'year_acquired' => 2021,
                'purchase_cost' => 320.00, 'purchase_date' => '2021-04-12', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Best Buy Commercial', 'warranty_start' => '2021-04-12', 'warranty_expiry' => '2023-04-12', 'contract_sla' => 'Standard Return Only',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'LAP-010', 'serial_number' => '5CD19283X', 'barcode' => 'BC-LAP-010', 'techspecs_id' => 'hp-250-g8',
                'device_type' => 'laptop', 'brand' => 'HP', 'model' => '250 G8',
                'location' => 'Branch Office - West Hub',
                'cpu' => 'Intel Core i3-1115G4', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => 'Intel UHD', 'gpu_tier' => 'none', 'year_acquired' => 2022,
                'purchase_cost' => 450.00, 'purchase_date' => '2022-09-01', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'HP Enterprise Care', 'warranty_start' => '2022-09-01', 'warranty_expiry' => now()->addDays(45)->toDateString(), 'contract_sla' => 'HP Base Hardware Support',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Desktops - Workstation / Dedicated-High
            [
                'asset_tag' => 'DSK-001', 'serial_number' => 'DPREC-9821-X', 'barcode' => 'BC-DSK-001', 'techspecs_id' => 'dell-precision-7960-tower',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'Precision 7960 Tower',
                'location' => 'HQ - Server Room / Lab 1',
                'cpu' => 'Intel Xeon w9-3495X', 'cpu_tier' => 'workstation', 'ram_gb' => 128, 'storage_type' => 'SSD', 'storage_gb' => 4096,
                'gpu' => 'NVIDIA RTX 6000 Ada 48GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 8950.00, 'purchase_date' => '2024-01-20', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Dell Commercial Direct', 'warranty_start' => '2024-01-20', 'warranty_expiry' => '2029-01-20', 'contract_sla' => 'Mission Critical 24x7 4-Hour Response',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'DSK-002', 'serial_number' => 'HPZ8-1928-W', 'barcode' => 'BC-DSK-002', 'techspecs_id' => 'hp-z8-g5-workstation',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'Z8 G5 Workstation',
                'location' => 'HQ - AI Research Center',
                'cpu' => 'Intel Xeon w7-2495X', 'cpu_tier' => 'workstation', 'ram_gb' => 64, 'storage_type' => 'SSD', 'storage_gb' => 2048,
                'gpu' => 'NVIDIA RTX 4500 Ada 24GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 6200.00, 'purchase_date' => '2024-02-05', 'depreciation_rate_percent' => 20.0,
                'vendor' => 'HP Enterprise Care', 'warranty_start' => '2024-02-05', 'warranty_expiry' => '2029-02-05', 'contract_sla' => 'HP 5-Year Next Business Day Onsite',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'DSK-003', 'serial_number' => 'RIG-TR-7970-01', 'barcode' => 'BC-DSK-003', 'techspecs_id' => 'custom-ai-studio-rig',
                'device_type' => 'desktop', 'brand' => 'Custom', 'model' => 'AI Studio Rig',
                'location' => 'HQ - AI Research Center',
                'cpu' => 'AMD Threadripper 7970X', 'cpu_tier' => 'workstation', 'ram_gb' => 64, 'storage_type' => 'SSD', 'storage_gb' => 2048,
                'gpu' => 'NVIDIA RTX 4090 24GB', 'gpu_tier' => 'dedicated-high', 'year_acquired' => 2024,
                'purchase_cost' => 5400.00, 'purchase_date' => '2024-03-10', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'System76 / Custom Builder', 'warranty_start' => '2024-03-10', 'warranty_expiry' => '2027-03-10', 'contract_sla' => 'Parts & Labor 3-Year Coverage',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Desktops - High / Dedicated-Entry or Integrated
            [
                'asset_tag' => 'DSK-004', 'serial_number' => 'OPTI-7010-891', 'barcode' => 'BC-DSK-004', 'techspecs_id' => 'dell-optiplex-7010-tower',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 7010 Tower',
                'location' => 'HQ - Engineering Suite',
                'cpu' => 'Intel Core i7-13700', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'NVIDIA GTX 1650 4GB', 'gpu_tier' => 'dedicated-entry', 'year_acquired' => 2023,
                'purchase_cost' => 1400.00, 'purchase_date' => '2023-04-15', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Dell Commercial Direct', 'warranty_start' => '2023-04-15', 'warranty_expiry' => '2026-04-15', 'contract_sla' => 'Dell ProSupport NBD',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'DSK-005', 'serial_number' => 'PD-600G9-3829', 'barcode' => 'BC-DSK-005', 'techspecs_id' => 'hp-prodesk-600-g9',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'ProDesk 600 G9',
                'location' => 'HQ - Operations Floor',
                'cpu' => 'Intel Core i7-13700', 'cpu_tier' => 'high', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 770', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 1100.00, 'purchase_date' => '2023-05-20', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'HP Enterprise Care', 'warranty_start' => '2023-05-20', 'warranty_expiry' => '2026-05-20', 'contract_sla' => 'HP Care Pack Next Business Day',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Desktops - Mid / Integrated
            [
                'asset_tag' => 'DSK-006', 'serial_number' => 'TC-M70Q-9182', 'barcode' => 'BC-DSK-006', 'techspecs_id' => 'lenovo-thinkcentre-m70q-gen4',
                'device_type' => 'desktop', 'brand' => 'Lenovo', 'model' => 'ThinkCentre M70q Tiny',
                'location' => 'HQ - Analytics Lab',
                'cpu' => 'Intel Core i5-13400T', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 730', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 850.00, 'purchase_date' => '2023-06-10', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Lenovo Premier Support', 'warranty_start' => '2023-06-10', 'warranty_expiry' => '2026-06-10', 'contract_sla' => 'Lenovo Premier NBD',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'DSK-007', 'serial_number' => 'OPTI-3000-471', 'barcode' => 'BC-DSK-007', 'techspecs_id' => 'dell-optiplex-3000-micro',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 3000 Micro',
                'location' => 'HQ - Customer Support Center',
                'cpu' => 'Intel Core i5-12500T', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 770', 'gpu_tier' => 'integrated', 'year_acquired' => 2023,
                'purchase_cost' => 820.00, 'purchase_date' => '2023-07-15', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Dell Commercial Direct', 'warranty_start' => '2023-07-15', 'warranty_expiry' => '2026-07-15', 'contract_sla' => 'Standard NBD Onsite',
                'condition' => 'good', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'DSK-008', 'serial_number' => 'ED-800G6-1192', 'barcode' => 'BC-DSK-008', 'techspecs_id' => 'hp-elitedesk-800-g6',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'EliteDesk 800 G6',
                'location' => 'HQ - HR Archives Room',
                'cpu' => 'Intel Core i5-10500', 'cpu_tier' => 'mid', 'ram_gb' => 16, 'storage_type' => 'SSD', 'storage_gb' => 512,
                'gpu' => 'Intel UHD 630', 'gpu_tier' => 'integrated', 'year_acquired' => 2021,
                'purchase_cost' => 900.00, 'purchase_date' => '2021-03-20', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'HP Enterprise Care', 'warranty_start' => '2021-03-20', 'warranty_expiry' => '2024-03-20', 'contract_sla' => 'Expired',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Desktops - Entry / None
            [
                'asset_tag' => 'DSK-009', 'serial_number' => 'OPTI-3080-293', 'barcode' => 'BC-DSK-009', 'techspecs_id' => 'dell-optiplex-3080',
                'device_type' => 'desktop', 'brand' => 'Dell', 'model' => 'OptiPlex 3080',
                'location' => 'HQ - Warehouse Office',
                'cpu' => 'Intel Core i3-10100', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'HDD', 'storage_gb' => 1000,
                'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2020,
                'purchase_cost' => 600.00, 'purchase_date' => '2020-05-10', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Dell Commercial Direct', 'warranty_start' => '2020-05-10', 'warranty_expiry' => '2023-05-10', 'contract_sla' => 'Expired',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],
            [
                'asset_tag' => 'DSK-010', 'serial_number' => 'TC-M720S-048', 'barcode' => 'BC-DSK-010', 'techspecs_id' => 'lenovo-thinkcentre-m720s',
                'device_type' => 'desktop', 'brand' => 'Lenovo', 'model' => 'ThinkCentre M720s',
                'location' => 'HQ - Security Reception Desk',
                'cpu' => 'Intel Core i3-9100', 'cpu_tier' => 'entry', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2020,
                'purchase_cost' => 580.00, 'purchase_date' => '2020-08-14', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'CDW IT Solutions', 'warranty_start' => '2020-08-14', 'warranty_expiry' => '2023-08-14', 'contract_sla' => 'Expired',
                'condition' => 'fair', 'status' => 'available', 'lifecycle_stage' => 'deployment'
            ],

            // Active In-Maintenance & Retired Lifecycle Assets
            [
                'asset_tag' => 'LAP-011', 'serial_number' => 'C02F23KLMD6R', 'barcode' => 'BC-LAP-011', 'techspecs_id' => 'apple-macbook-air-m1',
                'device_type' => 'laptop', 'brand' => 'Apple', 'model' => 'MacBook Air M1',
                'location' => 'IT Repair Bench - Desk 3',
                'cpu' => 'Apple M1 8-core', 'cpu_tier' => 'mid', 'ram_gb' => 8, 'storage_type' => 'SSD', 'storage_gb' => 256,
                'gpu' => 'Apple 7-core GPU', 'gpu_tier' => 'integrated', 'year_acquired' => 2021,
                'purchase_cost' => 999.00, 'purchase_date' => '2021-11-18', 'depreciation_rate_percent' => 25.0,
                'vendor' => 'Apple Enterprise Direct', 'warranty_start' => '2021-11-18', 'warranty_expiry' => '2024-11-18', 'contract_sla' => 'AppleCare+ Expired',
                'condition' => 'needs_repair', 'status' => 'in_repair', 'lifecycle_stage' => 'maintenance',
                'notes' => 'Swollen battery replacement and trackpad recalibration in progress.'
            ],
            [
                'asset_tag' => 'DSK-011', 'serial_number' => 'CQ-8200-LEGACY', 'barcode' => 'BC-DSK-011', 'techspecs_id' => 'hp-compaq-8200-elite',
                'device_type' => 'desktop', 'brand' => 'HP', 'model' => 'Compaq 8200 Elite',
                'location' => 'HQ - Decommissioning Depot (Basement)',
                'cpu' => 'Intel Core i5-2400', 'cpu_tier' => 'entry', 'ram_gb' => 4, 'storage_type' => 'HDD', 'storage_gb' => 500,
                'gpu' => null, 'gpu_tier' => 'none', 'year_acquired' => 2014,
                'purchase_cost' => 750.00, 'purchase_date' => '2014-06-12', 'depreciation_rate_percent' => 33.3,
                'vendor' => 'Legacy Hardware Vendor', 'warranty_start' => '2014-06-12', 'warranty_expiry' => '2017-06-12', 'contract_sla' => 'Decommissioned',
                'condition' => 'retired', 'status' => 'retired', 'lifecycle_stage' => 'retirement',
                'notes' => 'End of 10-year lifecycle. Hard drives wiped via NIST 800-88 standard. Awaiting electronic recycling.'
            ],

            // Newly Acquired Asset in Staging
            [
                'asset_tag' => 'LAP-012', 'serial_number' => 'PF5420MN', 'barcode' => 'BC-LAP-012', 'techspecs_id' => 'lenovo-thinkpad-x1-carbon-gen11',
                'device_type' => 'laptop', 'brand' => 'Lenovo', 'model' => 'ThinkPad X1 Carbon Gen 11',
                'location' => 'IT Staging / Procurement Depot',
                'cpu' => 'Intel Core i7-1365U', 'cpu_tier' => 'high', 'ram_gb' => 32, 'storage_type' => 'SSD', 'storage_gb' => 1024,
                'gpu' => 'Intel Iris Xe', 'gpu_tier' => 'integrated', 'year_acquired' => 2024,
                'purchase_cost' => 2150.00, 'purchase_date' => now()->subDays(3)->toDateString(), 'depreciation_rate_percent' => 20.0,
                'vendor' => 'Lenovo Premier Support', 'warranty_start' => now()->subDays(3)->toDateString(), 'warranty_expiry' => now()->addYears(3)->toDateString(), 'contract_sla' => 'Premier Support Plus 3-Yr',
                'condition' => 'excellent', 'status' => 'available', 'lifecycle_stage' => 'acquisition',
                'notes' => 'Newly arrived from vendor. Staging corporate image, disk encryption, and asset tags.'
            ],
        ];

        $devices = [];
        $adminUser = User::where('email', 'admin@specmatch.local')->first();

        foreach ($devicesData as $data) {
            $device = Device::create($data);
            $devices[$data['asset_tag']] = $device;

            // Seed initial lifecycle audit record
            \App\Models\LifecycleEvent::create([
                'device_id' => $device->id,
                'from_stage' => 'new',
                'to_stage' => $device->lifecycle_stage,
                'changed_by_user_id' => $adminUser?->id,
                'notes' => "Asset {$device->asset_tag} onboarded in {$device->lifecycle_stage} stage.",
            ]);
        }

        // Seed Sample Maintenance Activities
        // 1. In-progress battery repair for LAP-011
        $devices['LAP-011']->maintenanceLogs()->create([
            'type' => 'repair',
            'title' => 'OEM Battery Replacement & Thermal Paste',
            'description' => 'Swollen battery detected during physical audit. Unit taken off deployment. OEM battery replacement ordered and undergoing installation.',
            'cost' => 135.00,
            'performed_by' => 'Apex Tech Services / John Doe',
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
            'cost' => 160.00,
            'performed_by' => 'Internal IT Team',
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
            'cost' => 75.00,
            'performed_by' => 'Enterprise Hardware Specialist',
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
            'cost' => 50.00,
            'performed_by' => 'Vendor Onsite Engineer',
            'started_at' => now()->addDays(5),
            'completed_at' => null,
            'performance_assessment' => null,
            'status' => 'scheduled',
        ]);

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
