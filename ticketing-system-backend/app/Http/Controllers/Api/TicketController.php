<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTicketRequest;
use App\Http\Requests\UpdateTicketRequest;
use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class TicketController extends Controller
{
    /**
     * Display a listing of tickets
     */
    public function index(Request $request)
    {
        $user = $request->user();

        // Admin sees all tickets, Customer sees only their tickets
        $query = Ticket::with('user');

        if ($user->isCustomer()) {
            $query->where('user_id', $user->id);
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $tickets = $query->latest()->paginate(15);

        return response()->json($tickets);
    }

    /**
     * Store a newly created ticket
     */
    public function store(StoreTicketRequest $request)
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        // Handle file upload
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('tickets', 'public');
            $data['attachment_path'] = $path;
        }

        $ticket = Ticket::create($data);
        $ticket->load('user');

        return response()->json([
            'message' => 'Ticket created successfully',
            'ticket' => $ticket,
        ], 201);
    }

    /**
     * Display the specified ticket
     */
    public function show(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer() && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this ticket'
            ], 403);
        }

        $ticket->load(['user', 'comments', 'chats']);

        return response()->json([
            'ticket' => $ticket,
        ]);
    }

    /**
     * Update the specified ticket
     */
    public function update(UpdateTicketRequest $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer() && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this ticket'
            ], 403);
        }

        $data = $request->validated();

        // Handle file upload
        if ($request->hasFile('attachment')) {
            // Delete old file
            if ($ticket->attachment_path) {
                Storage::disk('public')->delete($ticket->attachment_path);
            }

            $path = $request->file('attachment')->store('tickets', 'public');
            $data['attachment_path'] = $path;
        }

        $ticket->update($data);
        $ticket->load('user');

        return response()->json([
            'message' => 'Ticket updated successfully',
            'ticket' => $ticket,
        ]);
    }

    /**
     * Remove the specified ticket
     */
    public function destroy(Request $request, Ticket $ticket)
    {
        $user = $request->user();

        // Check authorization
        if ($user->isCustomer() && $ticket->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized access to this ticket'
            ], 403);
        }

        // Delete attachment if exists
        if ($ticket->attachment_path) {
            Storage::disk('public')->delete($ticket->attachment_path);
        }

        $ticket->delete();

        return response()->json([
            'message' => 'Ticket deleted successfully',
        ]);
    }
}
