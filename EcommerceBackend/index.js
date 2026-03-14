// Setup
const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const path = require("node:path");
const corsMiddleware = require("./middlewares/cors.middleware");
const connectDB = require("./config/db.config");
const PORT = process.env.PORT;
const app = express();
connectDB();

// Middlewares
app.use(corsMiddleware);
app.use(express.json());
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
// Routes
app.use("/api/users", require("./routes/user.route")); // Done with auth and postman test
app.use("/api/cart", require("./routes/cart.route")); // Done with auth and postman test
app.use("/api/products", require("./routes/product.route")); // Done with auth and postman test
app.use("/api/categories", require("./routes/category.route")); // Done with auth and postman test
app.use("/api/sub-categories", require("./routes/subCategory.route")); // Done with auth and postman test
app.use("/api/orders", require("./routes/order.route")); // Done with auth and postman test
app.use("/api/faqs", require("./routes/FAQ.route")); // Done with auth and postman test
app.use("/api/testimonials", require("./routes/testimonial.route")); // Done with auth and postman test

// Listen
app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error to Run The Server: ${err.message}`);
  } else {
    console.log(`Server Runs at Port: ${PORT}`);
  }
});
