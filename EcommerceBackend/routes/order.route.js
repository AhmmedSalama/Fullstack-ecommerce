const express = require("express");
const {
  getAllOrders,
  getMyOrders,
  createOrder,
  updateMyOrder,
  changeStatus,
  rejectOrder,
  cancelOrder,
  deleteMyOrder,
} = require("../controllers/order.controller.js");
const {
  authenticate,
  authorize,
} = require("../middlewares/auth.middleware.js");
const router = express.Router();

// get all orders
router.get(
  "/all",
  authenticate,
  authorize("admin", "super-admin"),
  getAllOrders
);
// get user orders
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  getMyOrders
);
// make order
router.post(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  createOrder
);
// update order
router.put(
  "/:id",
  authenticate,
  authorize("user", "admin", "super-admin"),
  updateMyOrder
);
// change status
router.patch(
  "/status/:id",
  authenticate,
  authorize("admin", "super-admin"),
  changeStatus
);
// reject order
router.patch(
  "/reject/:id",
  authenticate,
  authorize("admin", "super-admin"),
  rejectOrder
);
// cancel order
router.patch(
  "/cancel/:id",
  authenticate,
  authorize("user", "admin", "super-admin"),
  cancelOrder
);
// delete order
router.delete(
  "/:id",
  authenticate,
  authorize("user", "admin", "super-admin"),
  deleteMyOrder
);

module.exports = router;
