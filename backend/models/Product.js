const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    images: [{ type: String, required: true }],
    description: { type: String, required: true },
    category: { type: String, required: true },
    subCategory: { type: String },
    stock: { type: Number, required: true, default: 0 },
    rating: { type: Number, default: 0 },
    reviewsCount: { type: Number, default: 0 },
    bestSeller: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

productSchema.pre("save", function(next) {
  if (this.discountPrice && this.discountPrice >= this.price) {
    return next(new Error("Offer Price (discountPrice) must be less than Actual Price (price)"));
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
