const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    auction_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auction",
      default: null
    },

    type: {
      type: String,
      enum: [
        "OUTBID",
        "NEW_OFFER",
        "OFFER_ACCEPTED",
        "OFFER_REJECTED",
        "AUCTION_WON",
        "AUCTION_ENDED",
        "TRANSACTION_COMPLETE",
        "NO_SHOW_STRIKE",
        "SECOND_CHANCE",
        "PENDING_CONTACT_REMINDER"
      ],
      required: true
    },

    message: {
      type: String,
      required: true,
      trim: true
    },

    is_read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

/* Optional index for faster notification fetch */
notificationSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
