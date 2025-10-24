<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'description',
        'category',
        'priority',
        'status',
        'attachment_path',
    ];

    protected $appends = ['attachment_url'];

    /**
     * Get the user that owns the ticket
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get comments for the ticket
     */
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get chats for the ticket
     */
    public function chats()
    {
        return $this->hasMany(Chat::class);
    }

    /**
     * Get attachment URL
     */
    public function getAttachmentUrlAttribute()
    {
        if ($this->attachment_path) {
            return asset('storage/' . $this->attachment_path);
        }
        return null;
    }
}
