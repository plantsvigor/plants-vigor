const express = require("express");
const router = express.Router();
const { upload } = require("../config/cloudinary");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const {
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
} = require("../controllers/adminController");
const { upsertBanner, deleteBanner, applyToAllBanners } = require("../controllers/bannerController");
const { getOrders, updateStatus } = require("../controllers/orderController");

// All routes here require authentication and admin role
router.use(protect);
router.use(admin);

router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({ url: req.file.path });
});

// Dashboard
router.get("/stats", getStats);

// Products
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateStatus);

// Users
router.get("/users", getUsers);
router.patch("/users/:id/status", toggleUserStatus);
router.delete("/users/:id", deleteUser);

// Reviews
router.get("/reviews", getReviews);
router.patch("/reviews/:id", moderateReview);

// Settings
router.get("/settings", getSettings);
router.put("/settings", updateSettings);

// Banners
router.post("/banners", upsertBanner);
router.post("/banners/bulk", applyToAllBanners);
router.delete("/banners/:id", deleteBanner);

module.exports = router;
