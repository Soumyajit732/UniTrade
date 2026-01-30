require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");

const connectDB = require("./config.js/db");
const startAuctionCloser = require("./jobs/auctionCloser");

/* ================= ROUTES ================= */
const aiRoutes = require("./routes/ai");
const authRoutes = require("./routes/auth");
const auctionRoutes = require("./routes/auction");
const bidRoutes = require("./routes/bid");
const offerRoutes = require("./routes/offer");
const notificationRoutes = require("./routes/notification");

/* ================= APP ================= */
const app = express();
const server = http.createServer(app);

/* ================= SOCKET.IO ================= */
const { Server } = require("socket.io");
const socketHandler = require("./sockets/index.js"); // 👈 socket/index.js

const io = new Server(server, {
  cors: {
    origin: "*", // tighten in production
    methods: ["GET", "POST"]
  }
});

// Make io accessible inside controllers (VERY IMPORTANT)
app.set("io", io);

// Initialize socket logic
socketHandler(io);

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= ROUTES ================= */
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/auctions", auctionRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Campus Auction System Backend Running");
});

/* ================= DATABASE + BACKGROUND JOBS ================= */
connectDB().then(() => {
  console.log("🚀 Starting auction auto-closer job");
  startAuctionCloser(io); // 👈 allows notifications on auto-close
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
