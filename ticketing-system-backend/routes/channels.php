<?php

return [
    'ticket.{id}' => function ($user, $ticketId) {
        $ticket = \App\Models\Ticket::find($ticketId);
        if (!$ticket) {
            return false;
        }

        // Admin can access all ticket channels
        if ($user->role === 'admin') {
            return true;
        }

        // Customer can only access their own ticket channels
        return $user->id === $ticket->user_id;
    },
];
