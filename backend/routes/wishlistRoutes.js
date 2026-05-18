const express = require("express");
const { getWishlist, toggleWishlist, clearWishlist } = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getWishlist);
router.post("/toggle", toggleWishlist);
router.delete("/", clearWishlist);

module.exports = router;
