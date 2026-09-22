<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StoryTag extends Model
{
    use HasFactory;

    protected $fillable = [
        'story_id',
        'tag_name',
    ];

    public function story(): BelongsTo
    {
        return $this->belongsTo(Story::class);
    }
}
