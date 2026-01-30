const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const {
  placeBid,
  getBidHistory
} = require("../controllers/bid");

// 🔐 Place a bid (protected)
router.post("/place", auth, placeBid);

// 📜 Get bid history (public)
router.get("/:auctionId", getBidHistory);

module.exports = router;
