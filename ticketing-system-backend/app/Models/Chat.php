<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'sender_id',
        'message',
    ];

    protected $with = ['sender'];

    /**
     * Get the ticket that owns the chat
     */
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    /**
     * Get the sender of the chat
     */
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
