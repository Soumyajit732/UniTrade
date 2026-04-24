const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Auction = require("../models/Auction");
const Message = require("../models/Message");
const { canAccessDealChat } = require("../controllers/chat");

module.exports = (io) => {

  /* ================= JWT AUTH MIDDLEWARE ================= */
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("auth_required"));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("_id name is_blocked");

      if (!user) return next(new Error("user_not_found"));
      if (user.is_blocked) return next(new Error("user_blocked"));

      socket.user = { _id: user._id.toString(), name: user.name };
      next();
    } catch {
      next(new Error("invalid_token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`🟢 ${socket.user.name} connected (${socket.id})`);

    // Auto-join user notification room using server-verified identity
    socket.join(socket.user._id);

    /* ================= USER NOTIFICATION ROOM ================= */
    // Kept for backward compatibility — auto-joined above, this is a no-op
    socket.on("joinUser", (userId) => {
      if (userId?.toString() !== socket.user._id) return;
    });

    /* ================= AUCTION ROOM ================= */
    socket.on("joinAuction", (auctionId) => {
      if (!auctionId) return;
      const room = auctionId.toString();
      if (!socket.rooms.has(room)) {
        socket.join(room);
        console.log(`🔗 ${socket.user.name} joined auction ${room}`);
      }
    });

    socket.on("leaveAuction", (auctionId) => {
      if (!auctionId) return;
      socket.leave(auctionId.toString());
      console.log(`🚪 ${socket.user.name} left auction ${auctionId}`);
    });

    /* ================= CHAT ROOMS ================= */
    socket.on("joinChat", async (auctionId) => {
      try {
        if (!auctionId) return;

        const auction = await Auction.findById(auctionId);
        if (!auction || !canAccessDealChat(auction, socket.user._id)) return;

        socket.join(`chat_${auctionId}`);
      } catch (err) {
        console.error("joinChat error:", err.message);
      }
    });

    socket.on("leaveChat", (auctionId) => {
      if (!auctionId) return;
      socket.leave(`chat_${auctionId}`);
    });

    // senderId/senderName now come from socket.user — not from the client
    socket.on("chatMessage", async ({ auctionId, text }) => {
      try {
        if (!text?.trim() || !auctionId) return;

        const auction = await Auction.findById(auctionId);
        const senderId = socket.user._id;
        if (!auction || !canAccessDealChat(auction, senderId)) return;

        const msg = await Message.create({
          auction_id: auctionId,
          sender_id: senderId,
          text: text.trim().slice(0, 1000)
        });

        io.to(`chat_${auctionId}`).emit("chatMessage", {
          _id: msg._id.toString(),
          auction_id: auctionId,
          sender_id: { _id: senderId, name: socket.user.name },
          text: msg.text,
          createdAt: msg.createdAt
        });
      } catch (err) {
        console.error("chatMessage error:", err.message);
      }
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      console.log(`🔴 ${socket.user.name} disconnected (${socket.id})`);
    });
  });
};
