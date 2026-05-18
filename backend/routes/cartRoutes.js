const express = require("express");
const { getCart, addItem, updateItem, removeItem, clearCart, updateItemBody } = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/items", addItem);
router.post("/add", addItem);
router.put("/update", updateItemBody);
router.patch("/items/:productId", updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);

module.exports = router;
