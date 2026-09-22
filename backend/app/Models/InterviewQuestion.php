<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InterviewQuestion extends Model
{
    use HasFactory;

    protected $fillable = [
        'interview_session_id',
        'question_number',
        'category',
        'question_text',
        'context_note',
        'ideal_answer_points',
        'difficulty',
    ];

    protected $casts = [
        'ideal_answer_points' => 'array',
    ];

    public function session(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class, 'interview_session_id');
    }

    public function answer(): HasOne
    {
        return $this->hasOne(InterviewAnswer::class);
    }
}
