const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

exports.sendOTPEmail = async (to, otp, purpose) => {
  await transporter.sendMail({
    from: `"Campus Auction System" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your OTP for ${purpose}`,
    html: `
      <h2>Campus Auction System</h2>
      <p>Your OTP for <b>${purpose}</b>:</p>
      <h1>${otp}</h1>
      <p>Valid for 5 minutes</p>
    `
  });
};
