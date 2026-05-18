const Product = require("../models/Product");
const { Order } = require("../models/Order");
const User = require("../models/User");
const Review = require("../models/Review");
const Settings = require("../models/Settings");

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const { range = "30d" } = req.query;
    const now = new Date();
    let startDate = new Date();

    if (range === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (range === "7d") {
      startDate.setDate(now.getDate() - 7);
    } else if (range === "15d") {
      startDate.setDate(now.getDate() - 15);
    } else {
      // Default 30d
      startDate.setDate(now.getDate() - 30);
    }

    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    
    // Filter orders by range for revenue and counts
    const ordersInRange = await Order.find({
      createdAt: { $gte: startDate }
    });
    
    const totalOrders = ordersInRange.length;
    const totalRevenue = ordersInRange.reduce((acc, order) => acc + (order.totalAmount || order.total || 0), 0);
    
    const recentOrdersRaw = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(5);

    const recentOrders = recentOrdersRaw.map(o => ({
      ...o.toObject(),
      id: o.orderCode,
      totalAmount: o.totalAmount || o.total || 0
    }));

    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).limit(5);

    // Dynamic Sales Data for Chart
    const salesData = [];
    if (range === "today") {
      // Group by hour
      for (let i = 0; i <= now.getHours(); i++) {
        const hourStart = new Date(startDate);
        hourStart.setHours(i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(i + 1, 0, 0, 0);

        const hourSales = ordersInRange
          .filter(o => {
            const date = new Date(o.createdAt);
            return date >= hourStart && date < hourEnd;
          })
          .reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0);

        salesData.push({
          name: `${i}:00`,
          sales: hourSales
        });
      }
    } else {
      // Group by day
      const daysCount = range === "7d" ? 7 : range === "15d" ? 15 : 30;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        d.setHours(0, 0, 0, 0);
        
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);

        const daySales = ordersInRange
          .filter(o => {
            const date = new Date(o.createdAt);
            return date >= d && date < nextD;
          })
          .reduce((acc, o) => acc + (o.totalAmount || o.total || 0), 0);

        salesData.push({
          name: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          sales: daySales
        });
      }
    }

    res.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue,
      recentOrders,
      lowStockProducts,
      salesData
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user status (active/inactive)
// @route   PATCH /api/admin/users/:id/status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "unblocked" : "blocked"} successfully`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manage Products (CRUD)
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ id: req.params.id });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manage Settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Manage Reviews
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({}).sort({ at: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const moderateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    
    if (req.body.action === "delete") {
      await Review.findByIdAndDelete(req.params.id);
      return res.json({ message: "Review deleted" });
    }
    
    review.isApproved = req.body.isApproved;
    await review.save();
    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getUsers,
  toggleUserStatus,
  deleteUser,
  createProduct,
  updateProduct,
  deleteProduct,
  getSettings,
  updateSettings,
  getReviews,
  moderateReview
};
