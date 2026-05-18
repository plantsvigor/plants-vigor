const express = require("express");
const { getRecent, pushRecent } = require("../controllers/recentController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", getRecent);
router.post("/", pushRecent);

module.exports = router;
