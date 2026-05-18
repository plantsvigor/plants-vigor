const Review = require("../models/Review");

const seed = [
  { productId: "p-monstera", author: "Aarav", rating: 5, comment: "Arrived super healthy and packaged beautifully!", at: Date.now() - 86400000 * 5 },
  { productId: "p-monstera", author: "Priya", rating: 4, comment: "Stunning leaves. One small tear but overall lovely.", at: Date.now() - 86400000 * 12 },
  { productId: "p-snake", author: "Rohan", rating: 5, comment: "Best plant for my bedroom. Thriving with zero effort.", at: Date.now() - 86400000 * 3 },
];

const ensureSeed = async () => {
  const count = await Review.estimatedDocumentCount();
  if (count === 0) {
    await Review.insertMany(seed);
  }
};

const getReviews = async (req, res) => {
  await ensureSeed();
  const productId = req.params.productId || req.query.productId;
  const query = productId ? { productId } : {};
  const docs = await Review.find(query).sort({ rating: -1, at: -1 });
  const reviews = docs.map((r) => ({
    id: r._id.toString(),
    productId: r.productId,
    author: r.author,
    rating: r.rating,
    comment: r.comment,
    at: r.at,
  }));
  res.json({ reviews });
};

const addReview = async (req, res) => {
  const { productId, author, rating, comment } = req.body;
  const review = await Review.create({ productId, author, rating, comment, at: Date.now() });
  res.status(201).json({
    id: review._id.toString(),
    productId: review.productId,
    author: review.author,
    rating: review.rating,
    comment: review.comment,
    at: review.at,
  });
};

module.exports = { getReviews, addReview };
