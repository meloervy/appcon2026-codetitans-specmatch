<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoleProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'min_cpu_tier',
        'min_ram_gb',
        'min_storage_gb',
        'requires_gpu',
        'min_gpu_tier',
        'portability_required',
        'description',
    ];

    protected $casts = [
        'min_ram_gb' => 'integer',
        'min_storage_gb' => 'integer',
        'requires_gpu' => 'boolean',
        'portability_required' => 'boolean',
    ];

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
