const Notification = require("../models/Notification");

/**
 * Send notification to a user
 */
exports.sendNotification = async (io, userId, type, message) => {
  // 1️⃣ Save to DB
  const notification = await Notification.create({
    user_id: userId,
    type,
    message
  });

  // 2️⃣ Emit via socket
  io.to(userId.toString()).emit("notification", {
    id: notification._id,
    type,
    message,
    createdAt: notification.createdAt
  });
};
