<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class InterviewAnswer extends Model
{
    use HasFactory;

    protected $fillable = [
        'interview_question_id',
        'answer_text',
        'follow_up_question',
        'follow_up_answer',
        'audio_url',
    ];

    public function question(): BelongsTo
    {
        return $this->belongsTo(InterviewQuestion::class, 'interview_question_id');
    }

    public function evaluation(): HasOne
    {
        return $this->hasOne(AnswerEvaluation::class);
    }
}
