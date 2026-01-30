const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const { sendNotification } = require("../services/notification.service");

/* ================= BID INCREMENT LOGIC ================= */
const getBidIncrement = (currentPrice) => {
  if (currentPrice < 1000) return 50;
  if (currentPrice < 5000) return 100;
  if (currentPrice < 10000) return 200;
  return 500;
};

/* ================= PLACE BID ================= */
exports.placeBid = async (req, res) => {
  try {
    const { auctionId, bid_amount } = req.body;
    const userId = req.user._id;

    if (!auctionId || !bid_amount) {
      return res.status(400).json({
        message: "Auction ID and bid amount are required"
      });
    }

    /* 1️⃣ Find auction */
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    /* 2️⃣ Validate auction state */
    if (auction.status !== "ACTIVE") {
      return res.status(400).json({ message: "Auction is not active" });
    }

    if (new Date() > auction.end_time) {
      return res.status(400).json({ message: "Auction has ended" });
    }

    /* 3️⃣ Prevent seller bidding */
    if (auction.seller_id.toString() === userId.toString()) {
      return res.status(403).json({
        message: "Seller cannot bid on own auction"
      });
    }

    /* 4️⃣ Get highest bid */
    const highestBid = await Bid.findOne({ auction_id: auctionId })
      .sort({ bid_amount: -1 });

    /* 5️⃣ Prevent consecutive bids by same user */
    if (highestBid && highestBid.bidder_id.toString() === userId.toString()) {
      return res.status(400).json({
        message: "You cannot place consecutive bids"
      });
    }

    /* 6️⃣ FIRST BID LOGIC */
    if (!highestBid) {
      if (bid_amount < auction.base_price) {
        return res.status(400).json({
          message: `First bid must be at least ₹${auction.base_price}`
        });
      }
    }
    /* 7️⃣ SUBSEQUENT BID LOGIC */
    else {
      const increment = getBidIncrement(auction.current_price);
      const minValidBid = auction.current_price + increment;

      if (bid_amount < minValidBid) {
        return res.status(400).json({
          message: `Minimum increment is ₹${increment}. Next valid bid: ₹${minValidBid}`
        });
      }

      if ((bid_amount - auction.current_price) % increment !== 0) {
        return res.status(400).json({
          message: `Bids must increase in multiples of ₹${increment}`
        });
      }
    }

    /* 8️⃣ Save previous bidder for notification */
    const previousBidderId = highestBid?.bidder_id;

    /* 9️⃣ Create bid */
    const bid = await Bid.create({
      auction_id: auctionId,
      bidder_id: userId,
      bid_amount
    });

    /* 🔟 Update auction price */
    auction.current_price = bid_amount;
    await auction.save();

    const io = req.app.get("io");

    /* 🔔 OUTBID NOTIFICATION */
    if (
      previousBidderId &&
      previousBidderId.toString() !== userId.toString()
    ) {
      await sendNotification(
        io,
        previousBidderId.toString(),
        "OUTBID",
        `You were outbid on "${auction.title}"`
      );
    }

    /* 🔴 REAL-TIME BID UPDATE */
    io.to(auctionId.toString()).emit("newBid", {
      auctionId,
      bid_amount,
      bidder: {
        id: userId,
        name: req.user.name
      }
    });

    res.status(201).json({
      message: "Bid placed successfully",
      bid
    });

  } catch (error) {
    console.error("Place Bid Error:", error);
    res.status(500).json({
      message: "Server error while placing bid"
    });
  }
};

/* ================= GET BID HISTORY ================= */
exports.getBidHistory = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.find({ auction_id: auctionId })
      .populate("bidder_id", "name branch year")
      .sort({ createdAt: -1 });

    res.status(200).json({ bids });

  } catch (error) {
    console.error("Get Bid History Error:", error);
    res.status(500).json({
      message: "Server error while fetching bids"
    });
  }
};
