const mongoose = require("mongoose");

const recentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    ids: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Recent", recentSchema);
