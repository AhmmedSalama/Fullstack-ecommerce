const Product = require("../models/product.model");

// prepare order
exports.validateAndPrepareOrder = async (products, session = null) => {
  if (!products || products.length === 0) {
    throw new Error("No products in the order");
  }
  // fetch products (price, stock)
  const productIds = products.map((p) => p.productId);
  const dbProducts = await Product.find(
    { _id: { $in: productIds }, isDeleted: false },
    { price: 1, stock: 1 }
  ).session(session);
  // check for all products
  if (dbProducts.length !== products.length) {
    throw new Error("Some products are invalid or unavailable");
  }
  // prepare order
  const orderProducts = [];
  let totalPrice = 0;
  for (const item of products) {
    const dbProduct = dbProducts.find((p) => p._id.equals(item.productId));
    if (!dbProduct) throw new Error(`Product ${item.productId} not found`);
    // check stock
    if (item.quantity > dbProduct.stock) {
      throw new Error(
        `Not enough stock for the product. Available: ${dbProduct.stock} items only`
      );
    }
    // push product and get total price
    orderProducts.push({
      product: item.productId,
      quantity: item.quantity,
      priceAtOrdering: dbProduct.price,
    });
    totalPrice += item.quantity * dbProduct.price;
  }
  return { orderProducts, totalPrice };
};

// decrements stock
exports.decrementStock = async (orderProducts, session = null) => {
  await Promise.all(
    orderProducts.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: -item.quantity } },
        { session }
      )
    )
  );
};

// restores stock
exports.restoreStock = async (orderProducts, session = null) => {
  await Promise.all(
    orderProducts.map((item) =>
      Product.updateOne(
        { _id: item.product },
        { $inc: { stock: item.quantity } },
        { session }
      )
    )
  );
};
