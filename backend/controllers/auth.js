const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { generateOTP, hashOTP } = require("../utils/otp");
const { sendOTPEmail } = require("../utils/sendEmail");

/* ================= SIGNUP ================= */

exports.signup = async (req, res) => {
  try {
    const { name, email, password, roll_no, branch, year, phone } = req.body;

    if (!name || !email || !password || !roll_no || !branch || !year) {
      return res.status(400).json({
        message: "All required fields must be provided"
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { roll_no }]
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with same email or roll number already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();

    await User.create({
      name,
      email,
      password: hashedPassword,
      roll_no,
      branch,
      year,
      phone,
      role: "STUDENT",
      otp: hashOTP(otp),
      otpExpiresAt: Date.now() + 5 * 60 * 1000
    });

    // ✅ SEND OTP VIA EMAIL
    await sendOTPEmail(email, otp, "Signup Verification");

    res.status(201).json({
      message: "OTP sent to email. Please verify to complete signup"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error during signup"
    });
  }
};

/* ============== VERIFY SIGNUP OTP ============== */

exports.verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.isVerified) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    if (
      user.otp !== hashOTP(otp) ||
      user.otpExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Signup verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roll_no: user.roll_no,
        branch: user.branch,
        year: user.year,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "OTP verification failed"
    });
  }
};

/* ================= LOGIN ================= */

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(401).json({
        message: "User not found or not verified"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password"
      });
    }

    const otp = generateOTP();

    user.otp = hashOTP(otp);
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000;
    await user.save();

    // ✅ SEND LOGIN OTP VIA EMAIL
    await sendOTPEmail(email, otp, "Login Verification");

    res.status(200).json({
      message: "OTP sent to email. Please verify to login"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error during login"
    });
  }
};

/* ============== VERIFY LOGIN OTP ============== */

exports.verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "Invalid request"
      });
    }

    if (
      user.otp !== hashOTP(otp) ||
      user.otpExpiresAt < Date.now()
    ) {
      return res.status(400).json({
        message: "Invalid or expired OTP"
      });
    }

    user.otp = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        roll_no: user.roll_no,
        branch: user.branch,
        year: user.year,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "OTP verification failed"
    });
  }
};
