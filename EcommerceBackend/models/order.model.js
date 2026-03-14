const mng = require("mongoose");

const orderSchema = new mng.Schema(
  {
    user: {
      type: mng.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: { type: mng.Schema.Types.ObjectId, ref: "Product" },
        quantity: { type: Number, required: true },
        priceAtOrdering: { type: Number, required: true },
      },
    ],
    totalPrice: { type: Number, required: true },
    shippingAddress: {
      type: {
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
        governorate: { type: String, required: true, trim: true },
      },
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "shipped",
        "delivered",
        "cancelled",
        "rejected",
      ],
      default: "pending",
    },
    orderedAt: { type: Date, default: Date.now() },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mng.model("Order", orderSchema);
