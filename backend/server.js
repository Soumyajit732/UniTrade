require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config.js/db");
const startAuctionCloser = require("./jobs/auctionCloser");
const { startAiPriceService } = require("./services/aiPrice.service");

const aiRoutes = require("./routes/ai");
const authRoutes = require("./routes/auth");
const auctionRoutes = require("./routes/auction");
const bidRoutes = require("./routes/bid");
const offerRoutes = require("./routes/offer");
const notificationRoutes = require("./routes/notification");
const profileRoutes = require("./routes/profile");
const chatRoutes = require("./routes/chat");



const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

/* ================= APP ================= */
const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const { Server } = require("socket.io");
const socketHandler = require("./sockets/index.js");

const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.set("io", io);
socketHandler(io);

/* ================= MIDDLEWARE ================= */
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Campus Auction System Backend Running");
});

/* ================= DATABASE + BACKGROUND JOBS ================= */
startAiPriceService();

connectDB().then(() => {
  console.log("🚀 Starting auction auto-closer job");
  startAuctionCloser(io); // 👈 allows notifications on auto-close
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5001;
server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use. Stop the other backend process or set a different PORT in backend/.env.`);
    process.exit(1);
  }

  console.error("❌ Server failed to start:", error);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
