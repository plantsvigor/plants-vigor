const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// @desc    Get product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let product = await Product.findOne({
      $or: [{ id: idOrSlug }, { slug: idOrSlug }],
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
};
