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
            $table->index('status');
            $table->index('lifecycle_stage');
            $table->index('condition');
            $table->index('warranty_expiry');
            $table->index('device_type');
            $table->index('cpu_tier');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->index('unassigned_at');
        });

        Schema::table('match_requests', function (Blueprint $table) {
            $table->index('employee_id');
        });

        Schema::table('maintenance_logs', function (Blueprint $table) {
            $table->index('status');
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('devices', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['lifecycle_stage']);
            $table->dropIndex(['condition']);
            $table->dropIndex(['warranty_expiry']);
            $table->dropIndex(['device_type']);
            $table->dropIndex(['cpu_tier']);
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->dropIndex(['unassigned_at']);
        });

        Schema::table('match_requests', function (Blueprint $table) {
            $table->dropIndex(['employee_id']);
        });

        Schema::table('maintenance_logs', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['type']);
        });
    }
};
