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
        Schema::create('role_profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->enum('min_cpu_tier', ['entry', 'mid', 'high', 'workstation']);
            $table->unsignedInteger('min_ram_gb');
            $table->unsignedInteger('min_storage_gb');
            $table->boolean('requires_gpu')->default(false);
            $table->enum('min_gpu_tier', ['none', 'integrated', 'dedicated-entry', 'dedicated-high'])->nullable();
            $table->boolean('portability_required')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_profiles');
    }
};
