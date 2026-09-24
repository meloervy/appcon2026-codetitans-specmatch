<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            // Asset Identification
            $table->string('serial_number', 100)->nullable()->unique()->after('asset_tag');
            $table->string('barcode', 100)->nullable()->after('serial_number');
            $table->string('techspecs_id', 100)->nullable()->after('barcode');

            // Inventory Location Tracking
            $table->string('location', 150)->nullable()->after('model');

            // Financial Tracking & Depreciation
            $table->decimal('purchase_cost', 10, 2)->nullable()->after('year_acquired');
            $table->date('purchase_date')->nullable()->after('purchase_cost');
            $table->decimal('depreciation_rate_percent', 5, 2)->default(20.00)->after('purchase_date');

            // Contractual Tracking (Vendor, Warranty & SLA)
            $table->string('vendor', 100)->nullable()->after('depreciation_rate_percent');
            $table->date('warranty_start')->nullable()->after('vendor');
            $table->date('warranty_expiry')->nullable()->after('warranty_start');
            $table->string('contract_sla', 100)->nullable()->after('warranty_expiry');

            // Lifecycle Stage
            $table->enum('lifecycle_stage', ['acquisition', 'deployment', 'reclaimed', 'maintenance', 'retirement'])
                ->default('deployment')
                ->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropColumn([
                'serial_number',
                'barcode',
                'techspecs_id',
                'location',
                'purchase_cost',
                'purchase_date',
                'depreciation_rate_percent',
                'vendor',
                'warranty_start',
                'warranty_expiry',
                'contract_sla',
                'lifecycle_stage',
            ]);
        });
    }
};
