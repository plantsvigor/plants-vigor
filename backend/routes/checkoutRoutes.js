const express = require("express");
const { buyNow } = require("../controllers/checkoutController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/buynow", protect, buyNow);

module.exports = router;
