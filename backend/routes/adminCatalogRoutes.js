const express = require("express");
const { getAdminCatalog, updateProduct, hideProduct, unhideProduct } = require("../controllers/adminCatalogController");

const router = express.Router();

router.get("/", getAdminCatalog);
router.patch("/product/:id", updateProduct);
router.patch("/product/:id/hide", hideProduct);
router.patch("/product/:id/unhide", unhideProduct);

module.exports = router;
