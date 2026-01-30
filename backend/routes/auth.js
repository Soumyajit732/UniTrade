const express = require("express");
const router = express.Router();

const {
  signup,
  verifySignupOTP,
  login,
  verifyLoginOTP
} = require("../controllers/auth");

router.post("/signup", signup);
router.post("/verify-signup-otp", verifySignupOTP);
router.post("/login", login);
router.post("/verify-login-otp", verifyLoginOTP);

module.exports = router;
