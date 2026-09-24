<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'role', 'department', 'job_title', 'phone', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = ['role_title', 'avatar_url'];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'role' => UserRole::class,
        ];
    }

    /**
     * Determine if the user is a super/system IT administrator.
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin;
    }

    /**
     * Determine if the user has an IT asset manager role.
     */
    public function isManager(): bool
    {
        return in_array($this->role, [UserRole::Admin, UserRole::Manager], true);
    }

    /**
     * Determine if the user is a hardware technician.
     */
    public function isTechnician(): bool
    {
        return in_array($this->role, [UserRole::Admin, UserRole::Manager, UserRole::Technician], true);
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string|UserRole $role): bool
    {
        if ($role instanceof UserRole) {
            return $this->role === $role;
        }

        return $this->role === UserRole::tryFrom($role);
    }

    /**
     * Human-readable role title for display in UI.
     */
    public function getRoleTitleAttribute(): string
    {
        if (! empty($this->job_title)) {
            return $this->job_title;
        }

        return $this->role?->title() ?? 'Enterprise Staff';
    }

    /**
     * Resolve browser avatar URL.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        if (empty($this->avatar)) {
            return null;
        }
        if (str_starts_with($this->avatar, 'http://') || str_starts_with($this->avatar, 'https://') || str_starts_with($this->avatar, '/')) {
            return $this->avatar;
        }
        if (str_starts_with($this->avatar, 'public/')) {
            return '/'.substr($this->avatar, 7);
        }

        return '/'.$this->avatar;
    }
}
