const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    type: {
      type: String,
      enum: [
        "OUTBID",
        "NEW_OFFER",        // ✅ ADD THIS
        "OFFER_ACCEPTED",
        "OFFER_REJECTED",
        "AUCTION_WON",
        "AUCTION_ENDED"
      ],
      required: true
    },

    message: {
      type: String,
      required: true
    },

    is_read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
