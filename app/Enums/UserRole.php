<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case Technician = 'technician';
    case Viewer = 'viewer';

    /**
     * Human-readable display title.
     */
    public function title(): string
    {
        return match ($this) {
            self::Admin => 'IT Administrator',
            self::Manager => 'IT Asset Manager',
            self::Technician => 'Hardware Technician',
            self::Viewer => 'IT Auditor',
        };
    }

    /**
     * Determine if this role can manage assets (create/edit/delete devices, employees, role profiles).
     */
    public function canManageAssets(): bool
    {
        return in_array($this, [self::Admin, self::Manager], true);
    }

    /**
     * Determine if this role can perform maintenance operations.
     */
    public function canPerformMaintenance(): bool
    {
        return in_array($this, [self::Admin, self::Manager, self::Technician], true);
    }

    /**
     * Determine if this role can trigger AI matching and assignments.
     */
    public function canMatch(): bool
    {
        return in_array($this, [self::Admin, self::Manager], true);
    }
}
