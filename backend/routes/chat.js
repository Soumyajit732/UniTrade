const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { getMessages } = require("../controllers/chat");

router.get("/:auctionId", auth, getMessages);

module.exports = router;
