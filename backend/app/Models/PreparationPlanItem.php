<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreparationPlanItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'preparation_plan_id',
        'day_number',
        'title',
        'focus_area',
        'description',
        'recommended_tasks',
        'target_skills',
        'is_completed',
    ];

    protected $casts = [
        'recommended_tasks' => 'array',
        'target_skills' => 'array',
        'is_completed' => 'boolean',
    ];

    public function preparationPlan(): BelongsTo
    {
        return $this->belongsTo(PreparationPlan::class);
    }
}
