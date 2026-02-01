const Notification = require("../models/Notification");

exports.sendNotification = async (io, userId, type, message) => {
  const notification = await Notification.create({
    user_id: userId,
    type,
    message
  });

  if (io) {
    io.to(userId.toString()).emit("notification", {
      _id: notification._id,
      type,
      message,
      createdAt: notification.createdAt
    });
  }

  return notification;
};
