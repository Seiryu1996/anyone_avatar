<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Stream extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'type',
        'stream_key',
        'thumbnail',
        'viewers_count',
        'is_live',
        'started_at',
        'ended_at',
    ];

    protected $casts = [
        'is_live' => 'boolean',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($stream) {
            $stream->stream_key = Str::random(32);
            $stream->started_at = now();
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function viewers()
    {
        return $this->belongsToMany(User::class, 'stream_viewers')
            ->withTimestamps();
    }
}
