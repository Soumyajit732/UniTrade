const express = require("express");
const router = express.Router();

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profile");

const authMiddleware = require("../middleware/auth");
const upload = require("../middleware/upload");

/* ================= PROFILE ROUTES ================= */

router.get("/", authMiddleware, getMyProfile);

router.put(
  "/",
  authMiddleware,
  upload.single("profilePic"),
  updateMyProfile
);

router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
