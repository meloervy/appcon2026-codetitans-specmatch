<?php

namespace App\Policies;

use App\Models\MaintenanceLog;
use App\Models\User;

class MaintenanceLogPolicy
{
    /**
     * Determine whether the user can view any maintenance logs.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create maintenance logs.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isTechnician();
    }

    /**
     * Determine whether the user can update the maintenance log.
     */
    public function update(User $user, MaintenanceLog $log): bool
    {
        return $user->isAdmin() || $user->isManager() || $user->isTechnician();
    }
}
