const mongoose = require("mongoose");

const adminCatalogSchema = new mongoose.Schema(
  {
    scope: { type: String, required: true, unique: true, default: "global" },
    productOverrides: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
    hiddenIds: [{ type: String }],
    customProducts: [{ type: mongoose.Schema.Types.Mixed }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminCatalog", adminCatalogSchema);
