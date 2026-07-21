import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, MessageSquare } from "lucide-react";
import api from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { withSocket, getSocket } from "../../hooks/useSocket";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import { formatRelativeTime, getInitials } from "../../utils/formatters";

export default function MessagesPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeConvo, setActiveConvo] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const activeConvoRef = useRef(null);
  const myId = user?._id?.toString();

  // Keep ref in sync with state so socket handler always has latest convo
  useEffect(() => {
    activeConvoRef.current = activeConvo;
  }, [activeConvo]);

  // Auto scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket listener — set up once per session ─────────────────
  useEffect(() => {
    const handleMessage = (msg) => {
      const convo = activeConvoRef.current;
      if (!convo) return;

      const incomingSenderId =
        msg.senderId?._id?.toString() || msg.senderId?.toString() || "";

      // Only add messages from the OTHER person
      // My own messages are added in onSuccess of sendMsg
      if (incomingSenderId !== myId) {
        setMessages((prev) => {
          // Prevent duplicates by _id
          if (msg._id) {
            const exists = prev.some(
              (m) => m._id?.toString() === msg._id?.toString(),
            );
            if (exists) return prev;
          }
          return [
            ...prev,
            {
              ...msg,
              createdAt: msg.createdAt || new Date().toISOString(),
            },
          ];
        });
      }
    };

    // Wait for socket to be ready then attach listener
    withSocket((s) => {
      s.off("receive_message"); // remove any old listener first
      s.on("receive_message", handleMessage);
      console.log("✅ receive_message listener attached");
    });

    return () => {
      const s = getSocket();
      if (s) s.off("receive_message", handleMessage);
    };
  }, [myId]); // runs once per user

  // ── Join socket room when conversation changes ─────────────────
  useEffect(() => {
    if (!activeConvo) return;

    withSocket((s) => {
      s.emit("join_room", {
        propertyId: activeConvo.propertyId,
        otherUserId: activeConvo.otherUserId,
      });
      console.log("✅ Joined room:", activeConvo.otherName);
    });
  }, [activeConvo]);

  // ── Load conversations ─────────────────────────────────────────
  const { data: convosData, isLoading: convosLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: () => api.get("/messages/conversations").then((r) => r.data),
    refetchInterval: 5000,
  });

  // ── Load message thread ────────────────────────────────────────
  const { data: threadData, isLoading: threadLoading } = useQuery({
    queryKey: ["thread", activeConvo?.propertyId, activeConvo?.otherUserId],
    queryFn: () =>
      api
        .get(`/messages/${activeConvo.propertyId}/${activeConvo.otherUserId}`)
        .then((r) => r.data),
    enabled: !!activeConvo?.propertyId && !!activeConvo?.otherUserId,
  });

  // Set messages when thread data loads
  useEffect(() => {
    if (threadData?.data) {
      setMessages(threadData.data);
    }
  }, [threadData]);

  // ── Send message ───────────────────────────────────────────────
  const { mutate: sendMsg, isPending: sending } = useMutation({
    mutationFn: () =>
      api.post("/messages", {
        receiverId: activeConvo.otherUserId,
        propertyId: activeConvo.propertyId,
        content: newMessage,
      }),
    onSuccess: ({ data }) => {
      const saved = data.data;

      // Add my own message immediately to chat
      setMessages((prev) => [...prev, saved]);
      setNewMessage("");
      queryClient.invalidateQueries(["conversations"]);

      // Emit to other user via socket
      withSocket((s) => {
        s.emit("send_message", {
          propertyId: activeConvo.propertyId,
          otherUserId: activeConvo.otherUserId,
          content: saved.content,
          _id: saved._id,
          senderId: myId,
          createdAt: saved.createdAt,
        });
      });
    },
    onError: () => alert("Failed to send message. Please try again."),
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (newMessage.trim() && !sending) sendMsg();
    }
  };

  const handleSelectConvo = (convo) => {
    setMessages([]); // clear old messages
    setActiveConvo(convo);
  };

  // ── Parse conversations from backend ──────────────────────────
  const conversations = (convosData?.data || [])
    .map((c) => {
      const lastMsg = c.lastMessage || {};
      const senderId =
        lastMsg.senderId?._id?.toString() || lastMsg.senderId?.toString() || "";
      const receiverId =
        lastMsg.receiverId?._id?.toString() ||
        lastMsg.receiverId?.toString() ||
        "";
      const isMe = senderId === myId;
      const otherUserId = isMe ? receiverId : senderId;
      const otherUser = isMe ? lastMsg.receiverId : lastMsg.senderId;
      const otherName = otherUser?.name || "User";
      const propertyId =
        lastMsg.propertyId?._id?.toString() ||
        lastMsg.propertyId?.toString() ||
        "";

      return {
        propertyId,
        otherUserId,
        otherName,
        lastContent: lastMsg.content || "",
        unread: c.unread || 0,
      };
    })
    .filter((c) => c.propertyId && c.otherUserId);

  return (
    <div className="h-full flex gap-0 -m-4 md:-m-6 lg:-m-8">
      {/* ── Conversation List ──────────────────────────────────── */}
      <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Messages</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {conversations.length} conversation
            {conversations.length !== 1 ? "s" : ""}
          </p>
        </div>

        {convosLoading ? (
          <Spinner className="py-10" />
        ) : conversations.length === 0 ? (
          <div className="text-center py-10 px-4">
            <MessageSquare size={28} className="text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">No conversations yet</p>
            <p className="text-xs text-gray-300 mt-1">
              Send a message from a property page to start
            </p>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {conversations.map((convo, i) => {
              const isActive =
                activeConvo?.propertyId === convo.propertyId &&
                activeConvo?.otherUserId === convo.otherUserId;

              return (
                <button
                  key={i}
                  onClick={() => handleSelectConvo(convo)}
                  className={`w-full text-left p-4 border-b border-gray-50
                    hover:bg-gray-50 transition-colors
                    ${
                      isActive
                        ? "bg-primary-50 border-l-4 border-l-primary-800"
                        : ""
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-full bg-primary-800 text-white
                      flex items-center justify-center text-sm font-bold flex-shrink-0"
                    >
                      {getInitials(convo.otherName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {convo.otherName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {convo.lastContent}
                      </p>
                    </div>
                    {convo.unread > 0 && (
                      <span
                        className="bg-primary-800 text-white text-xs
                        rounded-full h-5 w-5 flex items-center justify-center
                        flex-shrink-0"
                      >
                        {convo.unread}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Chat Area ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {!activeConvo ? (
          <div className="flex-1 flex items-center justify-center">
            <EmptyState
              icon={MessageSquare}
              title="Select a conversation"
              description="Choose a conversation from the left to start chatting."
            />
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className="bg-white border-b border-gray-200 px-5 py-3
              flex items-center gap-3 flex-shrink-0"
            >
              <div
                className="h-9 w-9 rounded-full bg-primary-800 text-white
                flex items-center justify-center font-bold text-sm"
              >
                {getInitials(activeConvo.otherName)}
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {activeConvo.otherName}
                </p>
                <p className="text-xs text-gray-400">Property conversation</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {threadLoading ? (
                <Spinner className="py-10" />
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg, i) => {
                  const senderId =
                    msg.senderId?._id?.toString() ||
                    msg.senderId?.toString() ||
                    "";
                  const isMe = senderId === myId;

                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      {!isMe && (
                        <div
                          className="h-7 w-7 rounded-full bg-gray-300
                          text-gray-700 flex items-center justify-center
                          text-xs font-bold mr-2 flex-shrink-0 self-end"
                        >
                          {getInitials(activeConvo.otherName)}
                        </div>
                      )}
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2.5
                        rounded-2xl text-sm break-words
                        ${
                          isMe
                            ? "bg-primary-800 text-white rounded-br-sm"
                            : "bg-white text-gray-900 shadow-sm rounded-bl-sm"
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p
                          className={`text-xs mt-1
                          ${isMe ? "text-blue-200" : "text-gray-400"}`}
                        >
                          {formatRelativeTime(msg.createdAt || new Date())}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
              <div className="flex items-end gap-3">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                  rows={1}
                  className="input-field flex-1 resize-none"
                />
                <button
                  onClick={() => newMessage.trim() && !sending && sendMsg()}
                  disabled={!newMessage.trim() || sending}
                  className="bg-primary-800 text-white p-2.5 rounded-xl
                    hover:bg-primary-900 disabled:opacity-50
                    disabled:cursor-not-allowed transition-colors flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Press Enter to send · Shift+Enter for new line
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
