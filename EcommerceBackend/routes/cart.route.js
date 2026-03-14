const express = require("express");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  returnChangedPrice,
} = require("../controllers/cart.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  getCart
);
router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  addToCart
);
router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super-admin"),
  updateQuantity
);
router.put(
  "/return/:id",
  authenticate,
  authorize("user", "admin", "super-admin"),
  returnChangedPrice
);
router.delete(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  clearCart
);
router.delete(
  "/:id",
  authenticate,
  authorize("user", "admin", "super-admin"),
  removeFromCart
);

module.exports = router;
