const { Order, orderStatusEnum } = require("../models/Order");

const serialize = (doc) => ({
  id: doc.orderCode,
  userId: doc.userId,
  email: doc.email,
  products: doc.products || [],
  subtotal: doc.subtotal,
  delivery: doc.delivery,
  totalAmount: doc.totalAmount || doc.total, // Fallback for old orders
  payment: doc.payment,
  paymentId: doc.paymentId,
  address: doc.address,
  status: doc.status,
  createdAt: doc.createdAtMs || doc.createdAt,
  history: doc.history,
});

const generateCode = () => `PO${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 999)}`;

const getOrders = async (req, res) => {
  const { userId, email } = req.query;
  const filter = {};
  if (userId || email) {
    filter.$or = [];
    if (userId) filter.$or.push({ userId });
    if (email) filter.$or.push({ email: String(email).toLowerCase() });
  }
  const orders = await Order.find(filter).sort({ createdAtMs: -1 });
  res.json({ orders: orders.map(serialize) });
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      $or: [
        { userId: req.user._id.toString() },
        { email: req.user.email }
      ]
    }).sort({ createdAtMs: -1 });
    res.json({ orders: orders.map(serialize) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrderById = async (req, res) => {
  const order = await Order.findOne({ orderCode: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(serialize(order));
};

const createOrder = async (req, res) => {
  const now = Date.now();
  const order = await Order.create({
    ...req.body,
    email: req.body.email.toLowerCase(),
    orderCode: generateCode(),
    status: "Pending",
    createdAtMs: now,
    history: [{ status: "Pending", at: now }],
  });
  res.status(201).json(serialize(order));
};

const updateStatus = async (req, res) => {
  const { status } = req.body;
  if (!orderStatusEnum.includes(status)) return res.status(400).json({ message: "Invalid status" });
  const order = await Order.findOne({ orderCode: req.params.id });
  if (!order) return res.status(404).json({ message: "Order not found" });
  order.status = status;
  order.history.push({ status, at: Date.now() });
  await order.save();
  res.json(serialize(order));
};

module.exports = { getOrders, getMyOrders, getOrderById, createOrder, updateStatus };
