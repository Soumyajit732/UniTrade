const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");
const mongoose = require("mongoose");
const { sendNotification } = require("../services/notification.service");

/* ================= CREATE AUCTION ================= */
exports.createAuction = async (req, res) => {
  try {
    const { title, description, category, base_price, end_time } = req.body;

    if (!title || !description || !category || !base_price || !end_time) {
      return res.status(400).json({ message: "All fields required" });
    }

    const basePriceNum = Number(base_price);
    if (isNaN(basePriceNum) || basePriceNum <= 0) {
      return res.status(400).json({ message: "Invalid base price" });
    }

    const endDate = new Date(end_time);
    if (isNaN(endDate.getTime()) || endDate <= new Date()) {
      return res.status(400).json({ message: "End time must be in the future" });
    }

    const imageUrls = req.files?.map(file => file.path) || [];

    const auction = await Auction.create({
      title,
      description,
      category,
      base_price: basePriceNum,
      current_price: basePriceNum,
      end_time: endDate,
      images: imageUrls,
      seller_id: req.user._id,
      status: "ACTIVE"
    });

    const io = req.app.get("io");
    io.emit("newAuction", { ...auction.toObject(), seller_id: req.user._id.toString() });

    res.status(201).json({
      message: "Auction created successfully",
      auction
    });

  } catch (error) {
    console.error("Create Auction Error:", error);
    res.status(500).json({ message: "Server error while creating auction" });
  }
};


/* ================= GET ALL ACTIVE AUCTIONS (paginated) ================= */
exports.getActiveAuctions = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const skip  = (page - 1) * limit;

    const filter = {
      status: "ACTIVE",
      end_time: { $gt: new Date() }
    };

    if (req.user) {
      filter.seller_id = { $ne: req.user._id };
    }

    const [auctions, total] = await Promise.all([
      Auction.find(filter)
        .populate("seller_id", "name branch year")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Auction.countDocuments(filter)
    ]);

    res.status(200).json({
      auctions,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasMore: page * limit < total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


/* ================= GET AUCTION BY ID ================= */
exports.getAuctionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid auction ID" });
    }

    const auction = await Auction.findById(req.params.id)
    .populate("seller_id", "name branch year")
    .populate("winner_id", "name email");
  

    if (!auction) {
      return res.status(404).json({
        message: "Auction not found"
      });
    }

    res.status(200).json({ auction });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching auction"
    });
  }
};

/* ================= MY CREATED AUCTIONS ================= */
exports.getMyCreatedAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ seller_id: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ auctions });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching created auctions"
    });
  }
};

/* ================= MY WON AUCTIONS ================= */
exports.getMyWonAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ winner_id: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ auctions });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching won auctions"
    });
  }
};

/* ================= MARK TRANSACTION COMPLETE ================= */
exports.markComplete = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.seller_id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (auction.status !== "CLOSED")
      return res.status(400).json({ message: "Auction is not closed" });

    if (auction.transaction_status !== "PENDING_CONTACT")
      return res.status(400).json({ message: "Transaction already resolved" });

    auction.transaction_status = "COMPLETED";
    await auction.save();

    const io = req.app.get("io");
    await sendNotification(
      io,
      auction.winner_id,
      "TRANSACTION_COMPLETE",
      `The seller confirmed the transaction for "${auction.title}" is complete. Enjoy!`
    );

    return res.status(200).json({ message: "Transaction marked as complete" });
  } catch (error) {
    console.error("Mark Complete Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= REPORT NO-SHOW ================= */
exports.reportNoShow = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (auction.seller_id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    if (auction.status !== "CLOSED")
      return res.status(400).json({ message: "Auction is not closed" });

    if (auction.transaction_status !== "PENDING_CONTACT")
      return res.status(400).json({ message: "Transaction already resolved" });

    auction.transaction_status = "FAILED";
    await auction.save();

    const io = req.app.get("io");

    // Increment winner's no-show count and warn them
    const updatedWinner = await User.findByIdAndUpdate(
      auction.winner_id,
      { $inc: { no_show_count: 1 } },
      { new: true }
    );

    const strikeMsg = updatedWinner.no_show_count >= 2
      ? `You now have ${updatedWinner.no_show_count} no-show strikes — your bidding is restricted.`
      : `You now have ${updatedWinner.no_show_count} no-show strike. One more will restrict your bidding.`;

    await sendNotification(
      io,
      auction.winner_id,
      "NO_SHOW_STRIKE",
      `No-show reported for "${auction.title}". ${strikeMsg}`
    );

    // Notify the next-highest unique bidder
    const bids = await Bid.find({ auction_id: auction._id })
      .sort({ bid_amount: -1 })
      .populate("bidder_id", "_id name");

    const nextBid = bids.find(
      (b) => b.bidder_id._id.toString() !== auction.winner_id.toString()
    );

    if (nextBid) {
      await sendNotification(
        io,
        nextBid.bidder_id._id,
        "SECOND_CHANCE",
        `The winner of "${auction.title}" didn't follow through. You're next in line — contact the seller!`
      );
    }

    return res.status(200).json({ message: "No-show reported successfully" });
  } catch (error) {
    console.error("Report No-Show Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ================= MY PARTICIPATED AUCTIONS ================= */
exports.getMyParticipatedAuctions = async (req, res) => {
  try {
    const auctionIds = await Bid.find({ bidder_id: req.user._id })
      .distinct("auction_id");

    const auctions = await Auction.find({
      _id: { $in: auctionIds }
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ auctions });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching participated auctions"
    });
  }
};
