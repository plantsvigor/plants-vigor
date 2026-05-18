const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
  videoUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  instagramId: { type: String, required: true },
  avatarUrl: { type: String, required: true },
  profileUrl: { type: String, required: true },
}, {
  timestamps: true
});

module.exports = mongoose.model("Reel", reelSchema);
