/**
 * Socket.IO Main Handler
 * Responsibilities:
 * - User-specific rooms (notifications)
 * - Auction rooms (live bidding)
 * - Safe joins (no duplicates)
 * - Debug logging
 */

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 User connected:", socket.id);

    /* ================= DEBUG LOGGER ================= */
    socket.onAny((event, ...args) => {
      console.log("📡 SOCKET EVENT:", event, args);
    });

    /* ================= USER NOTIFICATION ROOM ================= */
    socket.on("joinUser", (userId) => {
      if (!userId) return;

      const room = userId.toString();

      if (!socket.rooms.has(room)) {
        socket.join(room);
        console.log(`🔔 User joined notification room: ${room}`);
      }
    });

    /* ================= AUCTION ROOM ================= */
    socket.on("joinAuction", (auctionId) => {
      if (!auctionId) return;

      const room = auctionId.toString();

      if (!socket.rooms.has(room)) {
        socket.join(room);
        console.log(`🔗 Socket ${socket.id} joined auction ${room}`);
      }
    });

    socket.on("leaveAuction", (auctionId) => {
      if (!auctionId) return;

      const room = auctionId.toString();
      socket.leave(room);
      console.log(`🚪 Socket ${socket.id} left auction ${room}`);
    });

    /* ================= DISCONNECT ================= */
    socket.on("disconnect", () => {
      console.log("🔴 User disconnected:", socket.id);
    });
  });
};
