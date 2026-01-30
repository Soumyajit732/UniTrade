const Offer = require("../models/Offer");
const Auction = require("../models/Auction");
const { sendNotification } = require("../services/notification.service");

/* ================= MAKE OFFER (BUYER) ================= */
exports.makeOffer = async (req, res) => {
  try {
    const { auctionId, offer_price } = req.body;
    const userId = req.user._id;

    if (!auctionId || !offer_price) {
      return res.status(400).json({
        message: "Auction ID and offer price required"
      });
    }

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.status !== "ACTIVE") {
      return res.status(400).json({ message: "Auction not active" });
    }

    if (offer_price >= auction.base_price) {
      return res.status(400).json({
        message: "Offer must be less than base price"
      });
    }

    /* 🔒 Seller cannot make offer */
    if (auction.seller_id.toString() === userId.toString()) {
      return res.status(403).json({
        message: "Seller cannot make an offer"
      });
    }

    /* 🚫 Prevent multiple pending offers by same buyer */
    const existingPendingOffer = await Offer.findOne({
      auction_id: auctionId,
      buyer_id: userId,
      status: "PENDING"
    });

    if (existingPendingOffer) {
      return res.status(400).json({
        message: "You already have a pending offer for this auction"
      });
    }

    /* ✅ Create offer */
    const offer = await Offer.create({
      auction_id: auctionId,
      buyer_id: userId,
      offer_price,
      status: "PENDING"
    });

    const io = req.app.get("io");

    /* 🔔 Notify SELLER */
    await sendNotification(
      io,
      auction.seller_id.toString(),
      "NEW_OFFER",
      `New offer of ₹${offer_price} received on "${auction.title}"`
    );

    res.status(201).json({
      message: "Offer sent successfully",
      offer
    });

  } catch (error) {
    console.error("Make Offer Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET MY OFFER (BUYER) ================= */
exports.getMyOfferForAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const offer = await Offer.findOne({
      auction_id: auctionId,
      buyer_id: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({ offer });

  } catch (error) {
    console.error("Get My Offer Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET OFFERS FOR SELLER ================= */
exports.getOffersForAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const offers = await Offer.find({ auction_id: auctionId })
      .populate("buyer_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ offers });

  } catch (error) {
    console.error("Get Offers Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= ACCEPT OFFER (SELLER) ================= */
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const auction = await Auction.findById(offer.auction_id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (offer.status !== "PENDING") {
      return res.status(400).json({
        message: "Offer already processed"
      });
    }

    /* ✅ Accept offer */
    offer.status = "ACCEPTED";
    await offer.save();

    /* ❌ Reject other pending offers */
    await Offer.updateMany(
      {
        auction_id: auction._id,
        _id: { $ne: offer._id },
        status: "PENDING"
      },
      { status: "REJECTED" }
    );

    /* 🔒 Close auction */
    auction.status = "CLOSED";
    auction.winner_id = offer.buyer_id;
    auction.final_price = offer.offer_price;
    auction.final_method = "OFFER";
    await auction.save();

    const io = req.app.get("io");

    /* 🔔 Notify BUYER (ACCEPTED) */
    await sendNotification(
      io,
      offer.buyer_id.toString(),
      "OFFER_ACCEPTED",
      `Your offer on "${auction.title}" was accepted`
    );

    /* 🔴 Broadcast auction end */
    io.to(auction._id.toString()).emit("auctionEnded", {
      auctionId: auction._id,
      winner_id: offer.buyer_id,
      final_price: offer.offer_price,
      method: "OFFER"
    });

    res.status(200).json({
      message: "Offer accepted and auction closed",
      offer
    });

  } catch (error) {
    console.error("Accept Offer Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= REJECT OFFER (SELLER) ================= */
exports.rejectOffer = async (req, res) => {
  try {
    const { offerId } = req.params;

    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    const auction = await Auction.findById(offer.auction_id);
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (auction.seller_id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (offer.status !== "PENDING") {
      return res.status(400).json({
        message: "Offer already processed"
      });
    }

    offer.status = "REJECTED";
    await offer.save();

    const io = req.app.get("io");

    /* 🔔 Notify BUYER (REJECTED) */
    await sendNotification(
      io,
      offer.buyer_id.toString(),
      "OFFER_REJECTED",
      `Your offer on "${auction.title}" was rejected`
    );

    res.status(200).json({
      message: "Offer rejected",
      offer
    });

  } catch (error) {
    console.error("Reject Offer Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
