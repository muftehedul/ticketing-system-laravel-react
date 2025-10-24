import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ticketService, commentService, chatService } from "../api/services";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  MessageCircle,
  Clock,
  User,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import echo from "../lib/echo";

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const chatContainerRef = useRef(null);

  const [commentText, setCommentText] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Fetch ticket details
  const { data: ticketData, isLoading } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.getById(id),
  });

  const ticket = ticketData?.ticket;

  // Fetch comments
  const { data: commentsData } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => commentService.getByTicket(id),
    enabled: !!id,
  });

  const comments = commentsData?.comments || [];

  // Fetch chat messages
  const { data: chatData } = useQuery({
    queryKey: ["chat", id],
    queryFn: () => chatService.getByTicket(id),
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds for real-time updates
  });

  const chatMessages = chatData?.chats || [];

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Set initial status
  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
    }
  }, [ticket]);

  // Real-time chat with Pusher
  useEffect(() => {
    if (!id) return;

    try {
      // Subscribe to the ticket's chat channel
      const channel = echo.private(`ticket.${id}`);

      // Listen for new messages
      channel.listen("ChatMessageSent", (data) => {
        // Invalidate and refetch chat messages
        queryClient.invalidateQueries(["chat", id]);
      });

      // Cleanup on unmount
      return () => {
        echo.leave(`ticket.${id}`);
      };
    } catch (error) {
      console.log("Pusher not configured, falling back to polling");
    }
  }, [id, queryClient]);

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: (message) => commentService.create(id, { message }),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries(["comments", id]);
      toast.success("Comment added successfully");
    },
    onError: () => {
      toast.error("Failed to add comment");
    },
  });

  // Send chat message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message) => chatService.send(id, { message }),
    onSuccess: () => {
      setChatMessage("");
      queryClient.invalidateQueries(["chat", id]);
    },
    onError: () => {
      toast.error("Failed to send message");
    },
  });

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status) => ticketService.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(["ticket", id]);
      setIsEditingStatus(false);
      toast.success("Status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  // Delete ticket mutation
  const deleteTicketMutation = useMutation({
    mutationFn: () => ticketService.delete(id),
    onSuccess: () => {
      toast.success("Ticket deleted successfully");
      navigate("/tickets");
    },
    onError: () => {
      toast.error("Failed to delete ticket");
    },
  });

  const handleAddComment = (e) => {
    e.preventDefault();
    if (commentText.trim()) {
      addCommentMutation.mutate(commentText);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      sendMessageMutation.mutate(chatMessage);
    }
  };

  const handleStatusUpdate = () => {
    if (newStatus !== ticket.status) {
      updateStatusMutation.mutate(newStatus);
    } else {
      setIsEditingStatus(false);
    }
  };

  const handleDeleteTicket = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this ticket? This action cannot be undone."
      )
    ) {
      deleteTicketMutation.mutate();
    }
  };

  const statusColors = {
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    resolved: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ticket Not Found
          </h2>
          <Link to="/tickets" className="text-indigo-600 hover:text-indigo-800">
            Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const canEdit = user?.role === "admin" || ticket.user_id === user?.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Support Ticketing
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/tickets"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tickets
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details & Comments */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Card */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {ticket.subject}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-indigo-100">
                      <span>Ticket #{ticket.id}</span>
                      <span>•</span>
                      <span>{ticket.category}</span>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleDeleteTicket}
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Status and Priority */}
                <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Status
                    </span>
                    {isEditingStatus && user?.role === "admin" ? (
                      <div className="flex items-center space-x-2">
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <button
                          onClick={handleStatusUpdate}
                          className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingStatus(false)}
                          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            statusColors[ticket.status]
                          }`}
                        >
                          {ticket.status.replace("_", " ").toUpperCase()}
                        </span>
                        {user?.role === "admin" && (
                          <button
                            onClick={() => setIsEditingStatus(true)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Priority
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        priorityColors[ticket.priority]
                      }`}
                    >
                      {ticket.priority.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Created
                    </span>
                    <div className="flex items-center text-sm text-gray-700">
                      <Clock className="w-4 h-4 mr-1" />
                      {new Date(ticket.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Submitted by
                    </span>
                    <div className="flex items-center text-sm text-gray-700">
                      <User className="w-4 h-4 mr-1" />
                      {ticket.user?.name || "Unknown"}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Description
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {ticket.description}
                  </p>
                </div>

                {/* Attachment */}
                {ticket.attachment_path && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Attachment
                    </h3>
                    <a
                      href={`http://localhost:8000/storage/${ticket.attachment_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      View Attachment
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Comments ({comments.length})
                </h3>
              </div>

              <div className="p-6">
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {comments.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      No comments yet
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {comment.user?.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {comment.user?.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 ml-10">{comment.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Form */}
                <form
                  onSubmit={handleAddComment}
                  className="mt-6 border-t border-gray-200 pt-6"
                >
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={
                        !commentText.trim() || addCommentMutation.isPending
                      }
                      className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {addCommentMutation.isPending
                        ? "Adding..."
                        : "Add Comment"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Live Chat Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <Send className="w-5 h-5 mr-2" />
                  Live Chat
                </h3>
                <p className="text-green-100 text-sm mt-1">
                  Real-time messaging
                </p>
              </div>

              {/* Chat Messages */}
              <div
                ref={chatContainerRef}
                className="h-96 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100"
              >
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center py-8 text-sm">
                    No messages yet. Start the conversation!
                  </p>
                ) : (
                  chatMessages.map((msg) => {
                    const isOwnMessage = msg.sender_id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isOwnMessage ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Sender Name */}
                        <p
                          className={`text-xs font-medium mb-1 px-1 ${
                            isOwnMessage ? "text-indigo-700" : "text-gray-600"
                          }`}
                        >
                          {isOwnMessage ? "You" : msg.sender?.name || "Unknown"}
                        </p>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-[75%] ${
                            isOwnMessage
                              ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-t-2xl rounded-l-2xl rounded-br-md"
                              : "bg-white text-gray-900 rounded-t-2xl rounded-r-2xl rounded-bl-md border border-gray-200"
                          } px-4 py-3 shadow-md`}
                        >
                          <p className="text-sm leading-relaxed break-words">
                            {msg.message}
                          </p>
                          <p
                            className={`text-xs mt-1.5 ${
                              isOwnMessage ? "text-indigo-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-gray-200 bg-white"
              >
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={
                      !chatMessage.trim() || sendMessageMutation.isPending
                    }
                    className="p-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:from-green-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;
