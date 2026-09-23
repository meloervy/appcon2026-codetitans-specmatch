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
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->string('asset_tag', 50)->unique();
            $table->enum('device_type', ['laptop', 'desktop']);
            $table->string('brand', 100);
            $table->string('model', 100);
            $table->string('cpu', 150);
            $table->enum('cpu_tier', ['entry', 'mid', 'high', 'workstation']);
            $table->unsignedInteger('ram_gb');
            $table->enum('storage_type', ['HDD', 'SSD']);
            $table->unsignedInteger('storage_gb');
            $table->string('gpu', 150)->nullable();
            $table->enum('gpu_tier', ['none', 'integrated', 'dedicated-entry', 'dedicated-high'])->default('none');
            $table->unsignedSmallInteger('year_acquired');
            $table->enum('condition', ['excellent', 'good', 'fair', 'needs_repair', 'retired']);
            $table->enum('status', ['available', 'assigned', 'in_repair', 'retired'])->default('available');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
