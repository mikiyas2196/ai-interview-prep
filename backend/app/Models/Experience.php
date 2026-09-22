<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Experience extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company',
        'title',
        'location',
        'type',
        'start_date',
        'end_date',
        'is_current',
        'description',
        'technologies',
    ];

    protected $casts = [
        'is_current' => 'boolean',
        'technologies' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
