<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Employee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department',
        'role_profile_id',
        'profile_picture',
        'notes',
    ];

    protected $attributes = [
        'profile_picture' => 'public/user/default-profile-picture.png',
    ];

    protected $appends = [
        'profile_picture_url',
    ];

    /**
     * Resolve profile picture path for browser display.
     */
    public function getProfilePictureUrlAttribute(): string
    {
        $pic = $this->profile_picture;
        if (empty($pic)) {
            return '/user/default-profile-picture.png';
        }
        if (str_starts_with($pic, 'public/')) {
            return '/'.substr($pic, 7);
        }

        return $pic;
    }

    public function roleProfile(): BelongsTo
    {
        return $this->belongsTo(RoleProfile::class);
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function activeAssignment(): HasOne
    {
        return $this->hasOne(Assignment::class)->whereNull('unassigned_at');
    }

    public function getCurrentDeviceAttribute(): ?Device
    {
        return $this->activeAssignment?->device;
    }
}
