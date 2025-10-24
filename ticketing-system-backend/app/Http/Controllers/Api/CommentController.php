<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCommentRequest;
use App\Models\Comment;
use App\Models\Ticket;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    /**
     * Display comments for a ticket
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

        $comments = $ticket->comments()->latest()->get();

        return response()->json([
            'comments' => $comments,
        ]);
    }

    /**
     * Store a new comment
     */
    public function store(StoreCommentRequest $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer() && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this ticket'
            ], 403);
        }

        $comment = Comment::create([
            'ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'message' => $request->message,
        ]);

        $comment->load('user');

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment,
        ], 201);
    }
}
