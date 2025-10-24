<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Ticket;
use App\Events\MessageSent;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Get chat messages for a ticket
     */
    public function index(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer() && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this ticket'
            ], 403);
        }

        $chats = $ticket->chats()->latest()->get();

        return response()->json([
            'chats' => $chats,
        ]);
    }

    /**
     * Send a chat message
     */
    public function store(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer() && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this ticket'
            ], 403);
        }

        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $chat = Chat::create([
            'ticket_id' => $ticket->id,
            'sender_id' => $user->id,
            'message' => $validated['message'],
        ]);

        $chat->load('sender');

        // Broadcast the message
        broadcast(new MessageSent($chat))->toOthers();

        return response()->json([
            'message' => 'Message sent successfully',
            'chat' => $chat,
        ], 201);
    }
}
