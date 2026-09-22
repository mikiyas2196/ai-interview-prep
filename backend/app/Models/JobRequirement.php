<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobRequirement extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_posting_id',
        'required_skills',
        'preferred_skills',
        'responsibilities',
        'technical_requirements',
        'soft_skills',
        'key_topics',
    ];

    protected $casts = [
        'required_skills' => 'array',
        'preferred_skills' => 'array',
        'responsibilities' => 'array',
        'technical_requirements' => 'array',
        'soft_skills' => 'array',
        'key_topics' => 'array',
    ];

    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
    }
}
