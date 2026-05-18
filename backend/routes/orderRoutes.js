const express = require("express");
const { getOrders, getMyOrders, getOrderById, createOrder, updateStatus } = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", getOrders);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", getOrderById);
router.post("/", createOrder);
router.patch("/:id/status", updateStatus);

module.exports = router;
