<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\FleetAssistantController;
use App\Http\Controllers\HardwareImageController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\MismatchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    // ------------------------------------------------------------------------
    // Read-Only & Universal Staff Routes (All Authenticated Roles)
    // ------------------------------------------------------------------------

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Devices (Listing & Detail Read-Only)
    Route::get('/devices', [DeviceController::class, 'index'])->name('devices.index');
    Route::get('/devices/{id}', [DeviceController::class, 'show'])->whereNumber('id')->name('devices.show');

    // Employees (Listing Read-Only)
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');

    // Central Maintenance Log (Read-Only)
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');

    // Role Profiles (Read-Only)
    Route::get('/role-profiles', [RoleProfileController::class, 'index'])->name('role-profiles.index');

    // Mismatch Detection & Fleet Audit (Read-Only)
    Route::get('/mismatches', [MismatchController::class, 'index'])->name('mismatches.index');

    // Gemini Fleet Assistant ("Talk to your Fleet")
    Route::get('/fleet-assistant/context', [FleetAssistantController::class, 'context'])->name('fleet-assistant.context');
    Route::post('/fleet-assistant/query', [FleetAssistantController::class, 'query'])->name('fleet-assistant.query');

    // Personal Account Profile Management
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['patch', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // ------------------------------------------------------------------------
    // IT Asset Management & Administrative Operations (Admin & Manager Only)
    // ------------------------------------------------------------------------
    Route::middleware('role:admin,manager')->group(function () {
        // Devices (Inventory Mutations & Lifecycle Management)
        Route::get('/devices/create', [DeviceController::class, 'create'])->name('devices.create');
        Route::get('/devices/export/pdf', [DeviceController::class, 'exportPdf'])->name('devices.export.pdf');
        Route::post('/devices', [DeviceController::class, 'store'])->name('devices.store');
        Route::put('/devices/{id}', [DeviceController::class, 'update'])->whereNumber('id')->name('devices.update');
        Route::delete('/devices/{id}', [DeviceController::class, 'destroy'])->whereNumber('id')->name('devices.destroy');
        Route::post('/devices/{id}/lifecycle', [DeviceController::class, 'updateLifecycle'])->whereNumber('id')->name('devices.lifecycle.update');
        Route::post('/devices/{id}/reclaim', [DeviceController::class, 'reclaim'])->whereNumber('id')->name('devices.reclaim');
        Route::post('/devices/{id}/retire', [DeviceController::class, 'retire'])->whereNumber('id')->name('devices.retire');

        // Hardware Imagery Lookup (Wikimedia & Canonical Registry)
        Route::post('/hardware/image-lookup', [HardwareImageController::class, 'lookup'])->name('hardware.image-lookup');

        // AI-Powered Device Spec Identification (Gemini)
        Route::post('/devices/identify-specs', [DeviceController::class, 'identifySpecs'])->name('devices.identify-specs');

        // Role Profiles (Configuration Mutations)
        Route::post('/role-profiles', [RoleProfileController::class, 'store'])->name('role-profiles.store');
        Route::put('/role-profiles/{id}', [RoleProfileController::class, 'update'])->whereNumber('id')->name('role-profiles.update');
        Route::delete('/role-profiles/{id}', [RoleProfileController::class, 'destroy'])->whereNumber('id')->name('role-profiles.destroy');

        // Employees (Directory Mutations & Allocation Actions)
        Route::get('/employees/export/pdf', [EmployeeController::class, 'exportPdf'])->name('employees.export.pdf');
        Route::get('/employees/export/csv', [EmployeeController::class, 'exportCsv'])->name('employees.export.csv');
        Route::post('/employees/import/csv', [EmployeeController::class, 'importCsv'])->name('employees.import.csv');
        Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
        Route::match(['put', 'post'], '/employees/{id}', [EmployeeController::class, 'update'])->whereNumber('id')->name('employees.update');
        Route::post('/employees/{id}/unassign', [EmployeeController::class, 'unassign'])->whereNumber('id')->name('employees.unassign');
        Route::post('/employees/{id}/offboard', [EmployeeController::class, 'offboard'])->whereNumber('id')->name('employees.offboard');

        // Match & Recommendation Engine
        Route::get('/match', [MatchingController::class, 'index'])->name('match.index');
        Route::post('/match/extract', [MatchingController::class, 'extract'])->name('match.extract');
        Route::post('/match/rank', [MatchingController::class, 'rank'])->name('match.rank');
        Route::post('/match/assign', [MatchingController::class, 'assign'])->name('match.assign');
        Route::post('/match/simulate', [MatchingController::class, 'simulate'])->name('match.simulate');
        Route::post('/match/bridge-swap', [MatchingController::class, 'executeBridgeSwap'])->name('match.bridge-swap');
        Route::post('/match/test-gemini', [MatchingController::class, 'testGemini'])->name('match.test-gemini');
    });

    // ------------------------------------------------------------------------
    // Hardware Maintenance & Servicing Operations (Admin, Manager, Technician)
    // ------------------------------------------------------------------------
    Route::middleware('role:admin,manager,technician')->group(function () {
        Route::post('/devices/{id}/maintenance', [MaintenanceController::class, 'store'])->whereNumber('id')->name('devices.maintenance.store');
        Route::put('/maintenance/{id}', [MaintenanceController::class, 'update'])->whereNumber('id')->name('maintenance.update');
    });
});

require __DIR__.'/auth.php';
