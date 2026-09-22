<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnswerEvaluation extends Model
{
    use HasFactory;

    protected $fillable = [
        'interview_answer_id',
        'overall_score',
        'technical_accuracy',
        'clarity_structure',
        'relevance',
        'conciseness',
        'star_format_score',
        'strengths',
        'weaknesses',
        'coaching_feedback',
        'recommended_practice',
        'memory_candidates',
    ];

    protected $casts = [
        'strengths' => 'array',
        'weaknesses' => 'array',
        'recommended_practice' => 'array',
        'memory_candidates' => 'array',
    ];

    public function answer(): BelongsTo
    {
        return $this->belongsTo(InterviewAnswer::class, 'interview_answer_id');
    }
}
