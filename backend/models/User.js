const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ["STUDENT", "ADMIN"],
      default: "STUDENT"
    },

    roll_no: {
      type: String,
      unique: true,
      sparse: true // allows ADMIN to not have roll_no
    },

    branch: {
      type: String
    },

    year: {
      type: Number,
      min: 1,
      max: 5
    },

    phone: {
      type: String
    },

    profilePic: {
      public_id: {
        type: String
      },
      url: {
        type: String
      }
    },
    
    no_show_count: {
      type: Number,
      default: 0
    },

    is_blocked: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otp: String,
    otpExpiresAt: Date
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);
