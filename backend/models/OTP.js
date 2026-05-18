const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, expires: 300, default: Date.now } // Expires in 5 minutes (300 seconds)
});

module.exports = mongoose.model("OTP", otpSchema);
