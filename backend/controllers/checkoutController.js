const Product = require("../models/Product");

const buyNow = async (req, res) => {
  const { productId } = req.body;
  const product = await Product.findOne({ id: productId });

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  // Return product details for checkout
  res.json({
    productId: product.id,
    name: product.name,
    price: product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price,
    quantity: 1,
    image: product.images[0]
  });
};

module.exports = { buyNow };
