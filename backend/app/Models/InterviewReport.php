<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterviewReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'interview_session_id',
        'overall_score',
        'readiness_percentage',
        'summary',
        'strengths',
        'weaknesses',
        'recommended_next_steps',
    ];

    protected $casts = [
        'strengths' => 'array',
        'weaknesses' => 'array',
        'recommended_next_steps' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class, 'interview_session_id');
    }
}
