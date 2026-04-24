import React, { useEffect, useRef, useState } from "react";
import API from "../api/api";
import socket from "../api/socket";
import { Send, MessageCircle } from "lucide-react";

function ChatPanel({ auctionId, currentUser, partnerName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  /* ── Fetch history ───────────────────────── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get(`/chat/${auctionId}`);
        setMessages(res.data.messages || []);
      } catch {
        // no messages yet
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [auctionId]);

  /* ── Socket ──────────────────────────────── */
  useEffect(() => {
    socket.emit("joinChat", auctionId);

    const onMessage = (msg) => {
      if (msg.auction_id !== auctionId) return;
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chatMessage", onMessage);

    return () => {
      socket.emit("leaveChat", auctionId);
      socket.off("chatMessage", onMessage);
    };
  }, [auctionId]);

  /* ── Auto-scroll ─────────────────────────── */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Send ────────────────────────────────── */
  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    // senderId/senderName are taken from socket.user on the server — not trusted from client
    socket.emit("chatMessage", { auctionId, text });
    setInput("");
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[420px]">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
          <MessageCircle size={16} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-semibold text-blue-200 uppercase tracking-wide">Deal Chat</p>
          <p className="text-sm font-bold text-white leading-tight">{partnerName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-2">
            <MessageCircle size={28} className="text-slate-300" />
            <p className="text-slate-400 text-sm">No messages yet.<br />Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const senderId = msg.sender_id?._id?.toString() ?? msg.sender_id?.toString();
            const isMe = senderId === currentUser._id?.toString();
            return (
              <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
                  {!isMe && (
                    <span className="text-[11px] text-slate-400 px-1">{msg.sender_id?.name}</span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm break-words ${
                    isMe
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-sm"
                      : "bg-slate-100 text-slate-800 rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 px-1">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message…"
          className="flex-1 h-10 px-4 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="h-10 w-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl disabled:opacity-40 hover:opacity-90 transition-opacity flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;
