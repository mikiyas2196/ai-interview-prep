<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'memory_enabled',
        'voice_enabled',
        'immediate_feedback',
        'preferred_ai_model',
        'preferred_language',
        'dark_mode',
    ];

    protected $casts = [
        'memory_enabled' => 'boolean',
        'voice_enabled' => 'boolean',
        'immediate_feedback' => 'boolean',
        'dark_mode' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
