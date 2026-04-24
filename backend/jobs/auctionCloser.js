const cron = require("node-cron");
const mongoose = require("mongoose");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const User = require("../models/User");

const { sendNotification } = require("../services/notification.service");

const startAuctionCloser = (io) => {
  // Runs every hour — sends 48h contact reminder for unresolved transactions
  cron.schedule("0 * * * *", async () => {
    try {
      if (mongoose.connection.readyState !== 1) return;

      const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);

      const staleAuctions = await Auction.find({
        status: "CLOSED",
        transaction_status: "PENDING_CONTACT",
        reminder_sent: false,
        end_time: { $lte: cutoff }
      });

      for (const auction of staleAuctions) {
        await sendNotification(
          io,
          auction.winner_id,
          "PENDING_CONTACT_REMINDER",
          `Reminder: You won "${auction.title}" 48 hours ago. Please contact the seller to complete your purchase.`
        );
        await sendNotification(
          io,
          auction.seller_id,
          "PENDING_CONTACT_REMINDER",
          `Reminder: Your auction "${auction.title}" closed 48 hours ago. The winner has not yet been in contact.`
        );

        auction.reminder_sent = true;
        await auction.save();
      }
    } catch (error) {
      console.error("48h reminder error:", error.message);
    }
  });

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
          auction.transaction_status = "PENDING_CONTACT";

          // 🔔 Notify winner
          await sendNotification(
            io,
            highestBid.bidder_id,
            "AUCTION_WON",
            `🎉 You won the auction "${auction.title}" for ₹${highestBid.bid_amount}. Please contact the seller to complete the transaction.`
          );
        }

        // 🔔 Notify seller (optional but good UX)
        await sendNotification(
          io,
          auction.seller_id,
          "AUCTION_ENDED",
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
