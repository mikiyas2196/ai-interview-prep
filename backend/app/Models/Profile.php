<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'professional_headline',
        'location',
        'phone',
        'profile_photo_url',
        'career_goal',
        'target_roles',
        'professional_summary',
        'languages',
    ];

    protected $casts = [
        'target_roles' => 'array',
        'languages' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
