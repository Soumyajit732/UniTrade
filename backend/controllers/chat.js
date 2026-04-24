const Message = require("../models/Message");
const Auction = require("../models/Auction");

function canAccessDealChat(auction, userId) {
  const isParticipant =
    auction.seller_id.toString() === userId ||
    auction.winner_id?.toString() === userId;

  const isChatOpen =
    auction.status === "CLOSED" &&
    auction.winner_id &&
    auction.transaction_status === "PENDING_CONTACT";

  return isParticipant && isChatOpen;
}

/* ================= GET CHAT HISTORY ================= */
exports.getMessages = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const userId = req.user._id.toString();

    const auction = await Auction.findById(auctionId);
    if (!auction) return res.status(404).json({ message: "Auction not found" });

    if (!canAccessDealChat(auction, userId)) {
      return res.status(403).json({ message: "Chat is closed for this transaction" });
    }

    const messages = await Message.find({ auction_id: auctionId })
      .populate("sender_id", "name role")
      .sort({ createdAt: 1 });

    return res.status(200).json({ messages });
  } catch (error) {
    console.error("Get Messages Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.canAccessDealChat = canAccessDealChat;
