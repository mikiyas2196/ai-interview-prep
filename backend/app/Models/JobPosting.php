<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JobPosting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_title',
        'company',
        'location',
        'raw_description',
        'status',
        'experience_level',
        'education_requirements',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requirements(): HasOne
    {
        return $this->hasOne(JobRequirement::class);
    }
}
