const express = require("express");
const {
  getTestimonials,
  getApprovedTestimonials,
  addTestimonial,
  approveTestimonial,
  deleteTestimonial,
} = require("../controllers/testimonial.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get(
  "/all",
  authenticate,
  authorize("admin", "super-admin"),
  getTestimonials
);
router.get("/", getApprovedTestimonials);
router.post("/", authenticate, authorize("user"), addTestimonial);
router.put(
  "/approve/:id",
  authenticate,
  authorize("admin", "super-admin"),
  approveTestimonial
);
router.delete(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  deleteTestimonial
);

module.exports = router;
