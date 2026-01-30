const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const mongoose = require("mongoose");

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

    res.status(201).json({
      message: "Auction created successfully",
      auction
    });

  } catch (error) {
    console.error("Create Auction Error:", error);
    res.status(500).json({ message: "Server error while creating auction" });
  }
};


/* ================= GET ALL ACTIVE AUCTIONS ================= */
exports.getActiveAuctions = async (req, res) => {
  try {
    const filter = {
      status: "ACTIVE",
      end_time: { $gt: new Date() }
    };

    // Exclude seller's own auctions if logged in
    if (req.user) {
      filter.seller_id = { $ne: req.user._id };
    }

    const auctions = await Auction.find(filter)
      .populate("seller_id", "name branch year")
      .sort({ createdAt: -1 });

    res.status(200).json({ auctions });
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
