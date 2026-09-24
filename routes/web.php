<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\HardwareImageController;
use App\Http\Controllers\MaintenanceController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\MismatchController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RoleProfileController;
use App\Http\Controllers\TechSpecsController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }

    return redirect()->route('login');
});

Route::middleware('auth')->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Devices (Inventory & Lifecycle)
    Route::get('/devices', [DeviceController::class, 'index'])->name('devices.index');
    Route::get('/devices/create', [DeviceController::class, 'create'])->name('devices.create');
    Route::get('/devices/export/pdf', [DeviceController::class, 'exportPdf'])->name('devices.export.pdf');
    Route::post('/devices', [DeviceController::class, 'store'])->name('devices.store');
    Route::get('/devices/{id}', [DeviceController::class, 'show'])->name('devices.show');
    Route::put('/devices/{id}', [DeviceController::class, 'update'])->name('devices.update');
    Route::post('/devices/{id}/lifecycle', [DeviceController::class, 'updateLifecycle'])->name('devices.lifecycle.update');
    Route::post('/devices/{id}/retire', [DeviceController::class, 'retire'])->name('devices.retire');

    // Hardware Imagery Lookup (Wikimedia & Canonical Registry)
    Route::post('/hardware/image-lookup', [HardwareImageController::class, 'lookup'])->name('hardware.image-lookup');

    // TechSpecs API Hardware Lookup
    Route::post('/techspecs/search', [TechSpecsController::class, 'search'])->name('techspecs.search');
    Route::post('/techspecs/details', [TechSpecsController::class, 'details'])->name('techspecs.details');

    // Maintenance & Servicing Tracking
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/devices/{id}/maintenance', [MaintenanceController::class, 'store'])->name('devices.maintenance.store');
    Route::put('/maintenance/{id}', [MaintenanceController::class, 'update'])->name('maintenance.update');

    // Role Profiles
    Route::get('/role-profiles', [RoleProfileController::class, 'index'])->name('role-profiles.index');
    Route::post('/role-profiles', [RoleProfileController::class, 'store'])->name('role-profiles.store');
    Route::put('/role-profiles/{id}', [RoleProfileController::class, 'update'])->name('role-profiles.update');
    Route::delete('/role-profiles/{id}', [RoleProfileController::class, 'destroy'])->name('role-profiles.destroy');

    // Employees
    Route::get('/employees', [EmployeeController::class, 'index'])->name('employees.index');
    Route::get('/employees/export/pdf', [EmployeeController::class, 'exportPdf'])->name('employees.export.pdf');
    Route::get('/employees/export/csv', [EmployeeController::class, 'exportCsv'])->name('employees.export.csv');
    Route::post('/employees/import/csv', [EmployeeController::class, 'importCsv'])->name('employees.import.csv');
    Route::post('/employees', [EmployeeController::class, 'store'])->name('employees.store');
    Route::match(['put', 'post'], '/employees/{id}', [EmployeeController::class, 'update'])->name('employees.update');
    Route::post('/employees/{id}/unassign', [EmployeeController::class, 'unassign'])->name('employees.unassign');

    // Match & Recommendation Engine
    Route::get('/match', [MatchingController::class, 'index'])->name('match.index');
    Route::post('/match/extract', [MatchingController::class, 'extract'])->name('match.extract');
    Route::post('/match/rank', [MatchingController::class, 'rank'])->name('match.rank');
    Route::post('/match/assign', [MatchingController::class, 'assign'])->name('match.assign');
    Route::post('/match/bridge-swap', [MatchingController::class, 'executeBridgeSwap'])->name('match.bridge-swap');
    Route::post('/match/test-gemini', [MatchingController::class, 'testGemini'])->name('match.test-gemini');

    // Mismatch Detection & Fleet Audit
    Route::get('/mismatches', [MismatchController::class, 'index'])->name('mismatches.index');

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
