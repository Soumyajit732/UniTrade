const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const { sendNotification } = require("../services/notification.service");

const BID_COOLDOWN_SECONDS = 15;
const MAX_BIDS_PER_USER_PER_AUCTION = 10;
const BID_CAP_MULTIPLIER = 20;

/* ================= BID INCREMENT LOGIC ================= */
const getBidIncrement = (price) => {
  if (price < 1000) return 50;
  if (price < 5000) return 100;
  if (price < 10000) return 200;
  return 500;
};

/* ================= PLACE BID ================= */
exports.placeBid = async (req, res) => {
  try {
    const { auctionId, bid_amount } = req.body;
    const userId = req.user._id;

    if (!auctionId || bid_amount === undefined || bid_amount === null) {
      return res.status(400).json({ message: "Auction ID and bid amount are required" });
    }

    const parsedBid = Number(bid_amount);
    if (!Number.isFinite(parsedBid) || parsedBid <= 0) {
      return res.status(400).json({ message: "Bid amount must be a positive number" });
    }

    /* 1️⃣ Find auction */
    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    /* 2️⃣ Validate auction state */
    if (auction.status !== "ACTIVE") {
      return res.status(400).json({ message: "Auction is not active" });
    }
    if (new Date() > auction.end_time) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    /* 3️⃣ Prevent seller bidding */
    if (auction.seller_id.toString() === userId.toString()) {
      return res.status(403).json({ message: "Seller cannot bid on own auction" });
    }

    /* 4️⃣ No-show strike restriction */
    if (req.user.no_show_count >= 2) {
      return res.status(403).json({
        message: "Your bidding is restricted due to repeated no-shows. Contact admin to resolve."
      });
    }

    /* 5️⃣ Verified users only */
    if (!req.user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before placing bids" });
    }

    /* 6️⃣ Sanity cap — bid cannot exceed 20× base price */
    const bidCap = auction.base_price * BID_CAP_MULTIPLIER;
    if (parsedBid > bidCap) {
      return res.status(400).json({
        message: `Bid cannot exceed ₹${bidCap} (${BID_CAP_MULTIPLIER}× base price)`
      });
    }

    /* 7️⃣ Rate limiting + max-bids-per-user check (single round-trip) */
    const [lastUserBid, userBidCount] = await Promise.all([
      Bid.findOne({ auction_id: auctionId, bidder_id: userId }).sort({ createdAt: -1 }),
      Bid.countDocuments({ auction_id: auctionId, bidder_id: userId })
    ]);

    if (lastUserBid) {
      const secondsSinceLast = (Date.now() - new Date(lastUserBid.createdAt).getTime()) / 1000;
      if (secondsSinceLast < BID_COOLDOWN_SECONDS) {
        const wait = Math.ceil(BID_COOLDOWN_SECONDS - secondsSinceLast);
        return res.status(429).json({ message: `Please wait ${wait}s before bidding again` });
      }
    }

    if (userBidCount >= MAX_BIDS_PER_USER_PER_AUCTION) {
      return res.status(400).json({
        message: `You have reached the maximum of ${MAX_BIDS_PER_USER_PER_AUCTION} bids on this auction`
      });
    }

    /* 8️⃣ Get highest bid */
    const highestBid = await Bid.findOne({ auction_id: auctionId }).sort({ bid_amount: -1 });

    /* 9️⃣ Prevent consecutive bids */
    if (highestBid && highestBid.bidder_id.toString() === userId.toString()) {
      return res.status(400).json({ message: "You already have the highest bid" });
    }

    /* 🔟 Determine current price */
    const currentPrice = highestBid?.bid_amount ?? auction.current_price ?? auction.base_price;
    const increment = getBidIncrement(currentPrice);
    const minValidBid = currentPrice + increment;

    /* 1️⃣1️⃣ First bid rule */
    if (!highestBid && parsedBid < auction.base_price) {
      return res.status(400).json({ message: `First bid must be at least ₹${auction.base_price}` });
    }

    /* 1️⃣2️⃣ Increment validation */
    if (highestBid) {
      if (parsedBid < minValidBid) {
        return res.status(400).json({
          message: `Minimum increment is ₹${increment}. Next valid bid: ₹${minValidBid}`
        });
      }
      if ((parsedBid - currentPrice) % increment !== 0) {
        return res.status(400).json({
          message: `Bids must increase in multiples of ₹${increment}`
        });
      }
    }

    /* 1️⃣3️⃣ Atomic price update — prevents race conditions between concurrent bids */
    const priceUpdated = await Auction.findOneAndUpdate(
      { _id: auctionId, status: "ACTIVE", current_price: currentPrice },
      { $set: { current_price: parsedBid } }
    );

    if (!priceUpdated) {
      return res.status(409).json({
        message: "The price just changed. Please check the latest price and try again."
      });
    }

    /* 1️⃣4️⃣ Create bid record */
    const previousBidderId = highestBid?.bidder_id;

    const bid = await Bid.create({
      auction_id: auctionId,
      bidder_id: userId,
      bid_amount: parsedBid
    });

    const io = req.app.get("io");

    /* 🔔 Outbid notification */
    if (previousBidderId && previousBidderId.toString() !== userId.toString()) {
      await sendNotification(
        io,
        previousBidderId.toString(),
        "OUTBID",
        `You were outbid on "${auction.title}"`
      );
    }

    /* 📡 Room broadcast (AuctionDetail + SellerDashboard) */
    io.to(auctionId.toString()).emit("newBid", {
      auctionId,
      bid_amount: parsedBid,
      bidder: { id: userId, name: req.user.name }
    });

    /* 📡 Global broadcast (AuctionList price updates) */
    io.emit("bidPlaced", { auctionId: auctionId.toString(), bid_amount: parsedBid });

    return res.status(201).json({ message: "Bid placed successfully", bid });

  } catch (error) {
    console.error("Place Bid Error:", error);
    return res.status(500).json({ message: "Server error while placing bid" });
  }
};

/* ================= GET BID HISTORY ================= */
exports.getBidHistory = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.find({ auction_id: auctionId })
      .populate("bidder_id", "name branch year")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bids });

  } catch (error) {
    console.error("Get Bid History Error:", error);
    return res.status(500).json({ message: "Server error while fetching bids" });
  }
};
