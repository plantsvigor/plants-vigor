const express = require("express");
const router = express.Router();
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getAddresses);
router.post("/add", addAddress);
router.put("/update/:id", updateAddress);
router.delete("/delete/:id", deleteAddress);
router.put("/default/:id", setDefaultAddress);

module.exports = router;
