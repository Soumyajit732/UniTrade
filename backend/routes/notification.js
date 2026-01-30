const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const { getMyNotifications } = require("../controllers/notification");

router.get("/", auth, getMyNotifications);

module.exports = router;
