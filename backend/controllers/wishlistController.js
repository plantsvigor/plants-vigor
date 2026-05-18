const Wishlist = require("../models/Wishlist");

const getWishlist = async (req, res) => {
  const doc = await Wishlist.findOne({ userId: req.user._id });
  res.json({ ids: doc?.ids || [] });
};

const toggleWishlist = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.body;
  const doc = (await Wishlist.findOne({ userId })) || (await Wishlist.create({ userId, ids: [] }));
  doc.ids = doc.ids.includes(id) ? doc.ids.filter((x) => x !== id) : [...doc.ids, id];
  await doc.save();
  res.json({ ids: doc.ids });
};

const clearWishlist = async (req, res) => {
  const userId = req.user._id;
  const doc = (await Wishlist.findOne({ userId })) || (await Wishlist.create({ userId, ids: [] }));
  doc.ids = [];
  await doc.save();
  res.json({ ids: [] });
};

module.exports = { getWishlist, toggleWishlist, clearWishlist };
