<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProgressRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'readiness_percentage',
        'technical_score',
        'behavioral_score',
        'communication_score',
        'problem_solving_score',
        'record_date',
    ];

    protected $casts = [
        'record_date' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
