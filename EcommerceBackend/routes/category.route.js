const express = require("express");
const {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", getCategories);
router.post("/", authenticate, authorize("admin", "super-admin"), addCategory);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  updateCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  deleteCategory
);

module.exports = router;
