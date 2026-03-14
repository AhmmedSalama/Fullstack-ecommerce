const Order = require("../models/order.model");
const {
  validateAndPrepareOrder,
  restoreStock,
  decrementStock,
} = require("../utils/order.utils");
const mng = require("mongoose");

// get all orders (with optional filters by status or user)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, userId } = req.query;
    const query = { isDeleted: false };
    if (status) query.status = status;
    if (userId) query.user = userId;
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("products.product", "title price image stock");
    return res.status(200).json({
      message: "Get Orders",
      data: orders,
    });
  } catch (err) {
    console.error(`Error In getAllOrders(): ${err.message}`);
    return res.status(500).json({ message: "Getting Orders failed" });
  }
};

// get logged-in user orders
exports.getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { user: req.user._id, isDeleted: false };
    if (status) query.status = status;
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate("products.product", "title price image stock");
    return res.status(200).json({
      message: "Get Orders",
      data: orders,
    });
  } catch (err) {
    console.error(`Error In getMyOrders(): ${err.message}`);
    return res.status(500).json({ message: "Getting Orders failed" });
  }
};

// create new order
exports.createOrder = async (req, res) => {
  const session = await mng.startSession();
  session.startTransaction();
  try {
    const { products, shippingAddress, phone } = req.body;
    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }
    const { orderProducts, totalPrice } = await validateAndPrepareOrder(
      products,
      session
    );
    const createdOrder = await Order.create(
      [
        {
          user: req.user._id,
          products: orderProducts,
          totalPrice,
          shippingAddress,
          phone,
        },
      ],
      { session }
    );
    await decrementStock(orderProducts, session);
    await session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "Order created successfully",
      data: createdOrder,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error In createOrder(): ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

// update logged-in user's order if pending
exports.updateMyOrder = async (req, res) => {
  const session = await mng.startSession();
  session.startTransaction();
  try {
    const { products, shippingAddress, phone } = req.body;
    // get user order
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false,
    }).session(session);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // pending orders only can be updated
    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be updated" });
    }
    let orderProducts = order.products;
    let totalPrice = order.totalPrice;
    if (products && products.length > 0) {
      await restoreStock(order.products, session);
      const result = await validateAndPrepareOrder(products, session);
      orderProducts = result.orderProducts;
      totalPrice = result.totalPrice;
      await decrementStock(orderProducts, session);
    }
    // update order
    order.products = orderProducts;
    order.totalPrice = totalPrice;
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
    }
    if (phone) {
      order.phone = phone;
    }
    // save updated order
    const updatedOrder = await order.save({ session });
    // end transaction
    await session.commitTransaction();
    session.endSession();
    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error In updateMyOrder(): ${err.message}`);
    return res.status(500).json({ message: err.message });
  }
};

// change order status
exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (["delivered", "cancelled", "rejected"].includes(order.status)) {
      return res.status(400).json({ message: "The order is already finished" });
    }
    order.status = status;
    await order.save();
    return res.status(200).json({
      message: `Order Status changed to ${order.status} Successfully`,
      data: order,
    });
  } catch (err) {
    console.error(`Error In changeStatus(): ${err.message}`);
    return res.status(500).json({ message: "Changing Order status failed" });
  }
};

// reject an order before shipping
exports.rejectOrder = async (req, res) => {
  const session = await mng.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).session(session);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.status !== "pending" && order.status !== "preparing") {
      return res
        .status(400)
        .json({ message: "Only pending or preparing orders can be rejected" });
    }
    await restoreStock(order.products, session);
    order.status = "rejected";
    const rejectedOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Order Rejected Successfully",
      data: rejectedOrder,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error In rejectOrder(): ${err.message}`);
    return res.status(500).json({ message: "Rejecting Order failed" });
  }
};

// cancel logged-in user's order if pending
exports.cancelOrder = async (req, res) => {
  const session = await mng.startSession();
  session.startTransaction();
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false,
    }).session(session);

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Only pending orders can be cancelled" });
    }

    await restoreStock(order.products, session);
    order.status = "cancelled";
    const cancelledOrder = await order.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: "Order Cancelled Successfully",
      data: cancelledOrder,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(`Error In cancelOrder(): ${err.message}`);
    return res.status(500).json({ message: "Cancelling Order failed" });
  }
};

// delete logged-in user's order
exports.deleteMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false,
    });
    if (["pending", "preparing", "shipped"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "You can't delete unfinished orders" });
    }
    const deletedOrder = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isDeleted: true },
      { new: true }
    );

    if (!deletedOrder)
      return res.status(404).json({ message: "Order not found" });

    return res.status(200).json({
      message: "Order Deleted Successfully",
      data: deletedOrder,
    });
  } catch (err) {
    console.error(`Error In deleteMyOrder(): ${err.message}`);
    return res.status(500).json({ message: "Deleting Order failed" });
  }
};
