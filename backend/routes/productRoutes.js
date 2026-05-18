const express = require("express");
const router = express.Router();
const { getProducts, getProductByIdOrSlug } = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:idOrSlug", getProductByIdOrSlug);

module.exports = router;
