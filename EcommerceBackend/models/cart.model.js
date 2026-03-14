const mng = require("mongoose");

// Schema
const cartSchema = new mng.Schema(
  {
    user: {
      type: mng.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: {
          type: mng.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: { type: Number, default: 1 },
        priceAtAdding: { type: Number, required: true },
        isChanged: { type: Boolean, default: false },
      },
    ],
    totalQuantity: { type: Number, default: 0 },
    totalPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Calculate total quantity and price
cartSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    this.totalQuantity = this.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    this.totalPrice = this.items.reduce(
      (sum, item) => sum + item.quantity * item.priceAtAdding,
      0
    );
  } else {
    this.totalQuantity = 0;
    this.totalPrice = 0;
  }
  next();
});

module.exports = mng.model("Cart", cartSchema);
