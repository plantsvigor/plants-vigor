const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id });
  res.json({ items: cart?.items || [] });
};

const addItem = async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const userId = req.user._id;
  const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));
  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) existing.qty += qty;
  else cart.items.push({ productId, qty });
  await cart.save();
  res.status(201).json({ items: cart.items });
};

const updateItem = async (req, res) => {
  const { qty } = req.body;
  const { productId } = req.params;
  const userId = req.user._id;
  const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));
  if (qty <= 0) {
    cart.items = cart.items.filter((item) => item.productId !== productId);
  } else {
    const existing = cart.items.find((item) => item.productId === productId);
    if (existing) existing.qty = qty;
    else cart.items.push({ productId, qty });
  }
  await cart.save();
  res.json({ items: cart.items });
};

const removeItem = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;
  const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));
  cart.items = cart.items.filter((item) => item.productId !== productId);
  await cart.save();
  res.json({ items: cart.items });
};

const clearCart = async (req, res) => {
  const userId = req.user._id;
  const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));
  cart.items = [];
  await cart.save();
  res.json({ items: [] });
};

const updateItemBody = async (req, res) => {
  const { productId, qty } = req.body;
  const userId = req.user._id;
  
  if (qty < 1) return res.status(400).json({ message: "Quantity must be at least 1" });

  const cart = (await Cart.findOne({ userId })) || (await Cart.create({ userId, items: [] }));
  const existing = cart.items.find((item) => item.productId === productId);
  if (existing) {
    existing.qty = qty;
  } else {
    cart.items.push({ productId, qty });
  }
  await cart.save();
  res.json({ items: cart.items });
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart, updateItemBody };
