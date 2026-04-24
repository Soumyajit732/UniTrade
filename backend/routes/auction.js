const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  createAuction,
  getActiveAuctions,
  getAuctionById,
  getMyCreatedAuctions,
  getMyWonAuctions,
  getMyParticipatedAuctions,
  markComplete,
  reportNoShow
} = require("../controllers/auction");

/* ================= USER HISTORY ROUTES (MUST COME FIRST) ================= */

// Auctions created by logged-in user
router.get("/my-created", auth, getMyCreatedAuctions);

// Auctions won by logged-in user
router.get("/my-won", auth, getMyWonAuctions);

// Auctions user participated in
router.get("/my-participated", auth, getMyParticipatedAuctions);

/* ================= CORE AUCTION ROUTES ================= */

// Create auction (protected)
// router.post("/create", auth, createAuction);
router.post("/create", auth, upload.array("images", 5), createAuction);

// Get all active auctions (public)
router.get("/", auth, getActiveAuctions);

// Transaction resolution — seller only
router.put("/:id/complete", auth, markComplete);
router.put("/:id/no-show", auth, reportNoShow);

// Get single auction by ID (public) — MUST BE LAST
router.get("/:id", getAuctionById);

module.exports = router;
