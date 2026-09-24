<?php

namespace App\Policies;

use App\Models\Device;
use App\Models\User;

class DevicePolicy
{
    /**
     * Determine whether the user can view any devices.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the device.
     */
    public function view(User $user, Device $device): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create devices.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can update the device.
     */
    public function update(User $user, Device $device): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can delete the device.
     */
    public function delete(User $user, Device $device): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can export device inventory reports.
     */
    public function exportPdf(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can update device lifecycle stage.
     */
    public function updateLifecycle(User $user, Device $device): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can reclaim the device.
     */
    public function reclaim(User $user, Device $device): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can retire the device.
     */
    public function retire(User $user, Device $device): bool
    {
        return $user->isAdmin() || $user->isManager();
    }
}
