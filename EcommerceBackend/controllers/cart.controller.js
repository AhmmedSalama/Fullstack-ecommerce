const Cart = require("../models/cart.model");
const Product = require("../models/product.model");

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "title price image stock"
    );
    res.status(200).json({ message: `Your Cart`, data: cart });
  } catch (err) {
    console.log(`Error In getCart(): ${err.message}`);
    return res.status(500).json({ message: "Getting Cart failed" });
  }
};

exports.addToCart = async (req, res) => {
  try {
    let { productId, quantity, priceAtAdding } = req.body;
    const userId = req.user._id;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (!priceAtAdding) {
      priceAtAdding = product.price;
    }
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [{ product: productId, quantity, priceAtAdding }],
      });
    } else {
      const item = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (item) {
        item.quantity = quantity;
        item.priceAtAdding = priceAtAdding;
        item.isChanged = false;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          priceAtAdding,
          isChanged: false,
        });
      }
    }
    await cart.save();
    res
      .status(200)
      .json({ message: `Product Added to your Cart Successfully`, data: cart });
  } catch (err) {
    console.log(`Error In addToCart(): ${err}`);
    return res.status(500).json({ message: "Adding To Cart failed" });
  }
};

exports.updateQuantity = async (req, res) => {
  try {
    const { quantity } = req.body;
    const userId = req.user._id;
    const productId = req.params.id;
    let cart = await Cart.findOne({ user: userId });
    const item = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (item) {
      item.quantity = quantity;
    }
    await cart.save();
    res
      .status(200)
      .json({ message: `Product Quantity Updated Successfully`, data: cart });
  } catch (err) {
    console.log(`Error In updateQuantity(): ${err.message}`);
    return res.status(500).json({ message: "Update Quantity failed" });
  }
};

exports.returnChangedPrice = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.id;
    let cart = await Cart.findOne({ user: userId }).populate(
      "items.product",
      "price"
    );
    const item = cart.items.find(
      (item) => item.product._id.toString() === productId
    );
    if (item) {
      item.isChanged = false;
      item.priceAtAdding = item.product.price;
    }
    await cart.save();
    res.status(200).json({
      message: `Product returned to your cart Successfully`,
      data: cart,
    });
  } catch (err) {
    console.log(`Error In returnChangedPrice(): ${err.message}`);
    return res.status(500).json({ message: "Returning Product failed" });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    );
    await cart.save();
    res.status(200).json({
      message: `Product Removed From your Cart Successfully`,
      data: cart,
    });
  } catch (err) {
    console.log(`Error In removeFromCart(): ${err.message}`);
    return res.status(500).json({ message: "Removing From Cart failed" });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    cart.items = cart.items.filter((item) => item.isChanged);
    await cart.save();
    res.status(200).json({
      message: `your Cart cleared Successfully`,
      data: cart,
    });
  } catch (err) {
    console.log(`Error In clearCart(): ${err.message}`);
    return res.status(500).json({ message: "Clearing your Cart failed" });
  }
};
