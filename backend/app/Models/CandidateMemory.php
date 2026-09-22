<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateMemory extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'source_interview_session_id',
        'type',
        'topic',
        'description',
        'sentiment',
        'confidence',
        'vector_embedding',
        'is_active',
    ];

    protected $casts = [
        'confidence' => 'float',
        'vector_embedding' => 'array',
        'is_active' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceSession(): BelongsTo
    {
        return $this->belongsTo(InterviewSession::class, 'source_interview_session_id');
    }
}
