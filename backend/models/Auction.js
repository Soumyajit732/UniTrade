const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    category: {
      type: String,
      required: true
    },

    base_price: {
      type: Number,
      required: true,
      min: 0
    },

    current_price: {
      type: Number,
      required: true
    },

    images: {
      type: [String],
      default: []
    },    

    end_time: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED", "CANCELLED"],
      default: "ACTIVE"
    },

    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    winner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    
    final_price: {
      type: Number,
      default: null
    }
    
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Auction", auctionSchema);
