<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'device_id',
        'type',
        'title',
        'description',
        'cost',
        'performed_by',
        'started_at',
        'completed_at',
        'performance_assessment',
        'status',
    ];

    protected $casts = [
        'cost' => 'float',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }
}
