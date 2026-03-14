const express = require("express");
const {
  getSubCategories,
  addSubCategory,
  updateSubCategory,
  deleteSubCategory,
} = require("../controllers/subCategory.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", getSubCategories);
router.post(
  "/",
  authenticate,
  authorize("admin", "super-admin"),
  addSubCategory
);
router.put(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  updateSubCategory
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  deleteSubCategory
);

module.exports = router;
