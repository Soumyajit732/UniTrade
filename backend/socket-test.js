const { io } = require("socket.io-client");

const socket = io("http://localhost:5001");

const AUCTION_ID = "69680139a6a230170515a075";

socket.on("connect", () => {
  console.log("🟢 Connected to socket server:", socket.id);

  socket.emit("joinAuction", AUCTION_ID);
  console.log("🔗 Joined auction room:", AUCTION_ID);
});

socket.on("newBid", (data) => {
  console.log("🔴 New bid received (REAL-TIME):", data);
});

socket.on("disconnect", () => {
  console.log("🔴 Socket disconnected");
});
