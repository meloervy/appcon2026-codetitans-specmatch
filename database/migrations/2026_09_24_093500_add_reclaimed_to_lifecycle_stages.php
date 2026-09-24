<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `devices` MODIFY COLUMN `lifecycle_stage` ENUM('acquisition', 'deployment', 'reclaimed', 'maintenance', 'retirement') NOT NULL DEFAULT 'deployment'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE `devices` MODIFY COLUMN `lifecycle_stage` ENUM('acquisition', 'deployment', 'maintenance', 'retirement') NOT NULL DEFAULT 'deployment'");
        }
    }
};
