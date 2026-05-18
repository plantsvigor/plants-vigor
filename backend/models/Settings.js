const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: "GreenBloom" },
    whatsappNumber: { type: String, default: "+910000000000" },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
    },
    deliveryCharges: { type: Number, default: 49 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
