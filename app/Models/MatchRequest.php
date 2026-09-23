<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MatchRequest extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $fillable = [
        'employee_id',
        'raw_input',
        'extracted_requirements',
        'recommended_device_ids',
        'extraction_failed',
        'created_at',
    ];

    protected $casts = [
        'extracted_requirements' => 'array',
        'recommended_device_ids' => 'array',
        'extraction_failed' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
