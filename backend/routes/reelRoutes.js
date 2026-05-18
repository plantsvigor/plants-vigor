const express = require("express");
const router = express.Router();
const { getReels, createReel, deleteReel } = require("../controllers/reelController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { videoUpload } = require("../config/cloudinary");

router.get("/", getReels);
router.post("/", protect, admin, videoUpload.single("video"), createReel);
router.delete("/:id", protect, admin, deleteReel);

module.exports = router;
