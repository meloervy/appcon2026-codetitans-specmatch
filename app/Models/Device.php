<?php

namespace App\Models;

use App\Services\HardwareImageService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Device extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_tag',
        'serial_number',
        'barcode',
        'techspecs_id',
        'image_url',
        'device_type',
        'brand',
        'model',
        'location',
        'cpu',
        'cpu_tier',
        'ram_gb',
        'storage_type',
        'storage_gb',
        'gpu',
        'gpu_tier',
        'year_acquired',
        'purchase_cost',
        'purchase_date',
        'depreciation_rate_percent',
        'vendor',
        'warranty_start',
        'warranty_expiry',
        'contract_sla',
        'condition',
        'status',
        'lifecycle_stage',
        'notes',
    ];

    protected $casts = [
        'ram_gb' => 'integer',
        'storage_gb' => 'integer',
        'year_acquired' => 'integer',
        'purchase_cost' => 'float',
        'purchase_date' => 'date',
        'depreciation_rate_percent' => 'float',
        'warranty_start' => 'date',
        'warranty_expiry' => 'date',
    ];

    protected $appends = [
        'current_book_value',
        'warranty_status',
        'days_until_warranty_expiry',
        'image_clip_url',
    ];

    protected static function booted(): void
    {
        static::deleting(function (Device $device) {
            if ($device->activeAssignment()->exists() || $device->status === 'assigned') {
                throw new \DomainException("Cannot delete device {$device->asset_tag}: it is currently assigned to an employee.");
            }
        });
    }

    public function assignments(): HasMany
    {
        return $this->hasMany(Assignment::class);
    }

    public function activeAssignment(): HasOne
    {
        return $this->hasOne(Assignment::class)->whereNull('unassigned_at');
    }

    public function maintenanceLogs(): HasMany
    {
        return $this->hasMany(MaintenanceLog::class)->orderByDesc('started_at');
    }

    public function lifecycleEvents(): HasMany
    {
        return $this->hasMany(LifecycleEvent::class)->orderByDesc('created_at');
    }

    public function scopeAvailable($query)
    {
        return $query->where('status', 'available')
            ->whereNotIn('condition', ['needs_repair', 'retired']);
    }

    public function scopeReclaimed($query)
    {
        return $query->where('lifecycle_stage', 'reclaimed');
    }

    public function scopeDeployment($query)
    {
        return $query->where('lifecycle_stage', 'deployment');
    }

    /**
     * Determine if device is aging (>= 3 years old in service).
     */
    public function isAging(): bool
    {
        if ($this->purchase_date) {
            return Carbon::parse($this->purchase_date)->diffInYears(Carbon::now()) >= 3;
        }

        if ($this->year_acquired) {
            return (Carbon::now()->year - $this->year_acquired) >= 3;
        }

        return false;
    }

    /**
     * Determine if warranty is expired or nearing expiry (<= 60 days).
     */
    public function isWarrantyAtRisk(): bool
    {
        return in_array($this->warranty_status, ['expired', 'expiring_soon', 'none'], true);
    }

    /**
     * Determine if device has condition or maintenance risk.
     */
    public function hasConditionRisk(): bool
    {
        $cond = strtolower($this->condition ?? 'good');

        return in_array($cond, ['fair', 'poor', 'degraded', 'needs_repair'], true)
            || $this->status === 'in_repair'
            || $this->lifecycle_stage === 'maintenance';
    }

    /**
     * Compute current depreciated book value using straight-line annual depreciation.
     */
    public function getCurrentBookValueAttribute(): float
    {
        $cost = $this->purchase_cost ?? 65000.00;
        $rate = ($this->depreciation_rate_percent ?? 20.00) / 100.0;

        $startDate = $this->purchase_date ? Carbon::parse($this->purchase_date) : Carbon::createFromDate($this->year_acquired, 1, 1);
        $yearsElapsed = max(0, Carbon::now()->diffInDays($startDate) / 365.25);

        $depreciated = $cost * (1 - ($rate * $yearsElapsed));
        $salvageFloor = $cost * 0.10; // 10% salvage residual value floor

        return round(max($salvageFloor, $depreciated), 2);
    }

    /**
     * Determine warranty status ('active', 'expiring_soon', 'expired', or 'none').
     */
    public function getWarrantyStatusAttribute(): string
    {
        if (! $this->warranty_expiry) {
            return 'none';
        }

        $expiry = Carbon::parse($this->warranty_expiry);
        $now = Carbon::now();

        if ($expiry->isPast()) {
            return 'expired';
        }

        if ($expiry->diffInDays($now) <= 60) {
            return 'expiring_soon';
        }

        return 'active';
    }

    /**
     * Number of days until warranty expiry.
     */
    public function getDaysUntilWarrantyExpiryAttribute(): ?int
    {
        if (! $this->warranty_expiry) {
            return null;
        }

        $expiry = Carbon::parse($this->warranty_expiry);

        return (int) Carbon::now()->diffInDays($expiry, false);
    }

    /**
     * Resolved image clip URL from public asset library, Google Image Search, or authentic hardware registry.
     */
    public function getImageClipUrlAttribute(): string
    {
        return HardwareImageService::resolveForDevice($this);
    }
}
