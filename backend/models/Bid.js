const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    auction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      required: true
    },

    bidder_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    bid_amount: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Bid", bidSchema);
