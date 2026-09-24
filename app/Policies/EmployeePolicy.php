<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    /**
     * Determine whether the user can view any employees.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the employee.
     */
    public function view(User $user, Employee $employee): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create employees.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can update the employee.
     */
    public function update(User $user, Employee $employee): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can delete/offboard the employee.
     */
    public function delete(User $user, Employee $employee): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can export employee PDF reports.
     */
    public function exportPdf(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can export employee CSV reports.
     */
    public function exportCsv(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can import employees via CSV.
     */
    public function importCsv(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }
}
