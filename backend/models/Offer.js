const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema({
  auction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true
  },
  buyer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  offer_price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["PENDING", "ACCEPTED", "REJECTED", "COUNTERED"],
    default: "PENDING"
  },
  counter_price: Number
}, { timestamps: true });

module.exports = mongoose.model("Offer", offerSchema);
