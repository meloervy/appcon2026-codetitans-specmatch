<?php

namespace App\Policies;

use App\Models\RoleProfile;
use App\Models\User;

class RoleProfilePolicy
{
    /**
     * Determine whether the user can view any role profiles.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the role profile.
     */
    public function view(User $user, RoleProfile $roleProfile): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create role profiles.
     */
    public function create(User $user): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can update the role profile.
     */
    public function update(User $user, RoleProfile $roleProfile): bool
    {
        return $user->isAdmin() || $user->isManager();
    }

    /**
     * Determine whether the user can delete the role profile.
     */
    public function delete(User $user, RoleProfile $roleProfile): bool
    {
        return $user->isAdmin() || $user->isManager();
    }
}
