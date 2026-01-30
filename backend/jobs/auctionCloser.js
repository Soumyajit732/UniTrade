const cron = require("node-cron");
const mongoose = require("mongoose");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");

const { sendNotification } = require("../services/notification.service");

const startAuctionCloser = (io) => {
  // Runs every 5 minutes (Atlas-safe)
  cron.schedule("*/5 * * * *", async () => {
    try {
      // 🔒 MongoDB readiness guard
      if (mongoose.connection.readyState !== 1) {
        console.log("⚠️ MongoDB not ready, skipping auction closer run");
        return;
      }

      const now = new Date();

      const expiredAuctions = await Auction.find({
        status: "ACTIVE",
        end_time: { $lte: now }
      });

      for (const auction of expiredAuctions) {
        // Find highest bid
        const highestBid = await Bid.findOne({
          auction_id: auction._id
        }).sort({ bid_amount: -1 });

        if (highestBid) {
          auction.winner_id = highestBid.bidder_id;
          auction.final_price = highestBid.bid_amount;

          // 🔔 Notify winner
          await sendNotification(
            io,
            highestBid.bidder_id,
            "WIN",
            `🎉 You won the auction "${auction.title}" for ₹${highestBid.bid_amount}`
          );
        }

        // 🔔 Notify seller (optional but good UX)
        await sendNotification(
          io,
          auction.seller_id,
          "AUCTION_END",
          `Your auction "${auction.title}" has ended`
        );

        auction.status = "CLOSED";
        await auction.save();

        // 🔴 Emit real-time event

        let winnerUser = null;

        if (highestBid) {
        winnerUser = await User.findById(highestBid.bidder_id).select("name");
        }

        const payload = {
        auctionId: auction._id.toString(),
        winner_id: auction.winner_id,
        winner_name: winnerUser?.name || null,
        final_price: auction.final_price
        };

        // Auction detail listeners
        io.to(auction._id.toString()).emit("auctionEnded", payload);

        // Auction list listeners (GLOBAL)
        io.emit("auctionEnded", payload);

        console.log(`🏁 Auction closed: ${auction._id}`);

      }

    } catch (error) {
      console.error("Auction closer error:", error.message);
    }
  });
};

module.exports = startAuctionCloser;
