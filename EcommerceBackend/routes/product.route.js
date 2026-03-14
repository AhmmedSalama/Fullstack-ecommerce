const express = require("express");
const {
  getProducts,
  getProductBySlug,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductById,
} = require("../controllers/product.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const router = express.Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.get("/id/:id", getProductById);
router.post(
  "/",
  authenticate,
  authorize("admin", "super-admin"),
  upload.single("image"),
  addProduct
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  upload.single("image"),
  updateProduct
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  deleteProduct
);

module.exports = router;
