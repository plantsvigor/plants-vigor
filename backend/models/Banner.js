const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    categorySlug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);
