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
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained('devices')->cascadeOnDelete();
            $table->enum('type', ['repair', 'upgrade', 'preventive', 'inspection', 'replacement']);
            $table->string('title', 150);
            $table->text('description');
            $table->decimal('cost', 10, 2)->default(0.00);
            $table->string('performed_by', 150)->nullable();
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->text('performance_assessment')->nullable();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('completed');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
