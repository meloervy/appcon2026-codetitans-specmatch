<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_tag',
        'device_type',
        'brand',
        'model',
        'cpu',
        'cpu_tier',
        'ram_gb',
        'storage_type',
        'storage_gb',
        'gpu',
        'gpu_tier',
        'year_acquired',
        'condition',
        'status',
        'notes',
    ];

    protected $casts = [
        'ram_gb' => 'integer',
        'storage_gb' => 'integer',
        'year_acquired' => 'integer',
    ];

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function activeAssignment(): HasOne
    {
        return $this->hasOne(Assignment::class)->whereNull('unassigned_at');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available');
    }
}
