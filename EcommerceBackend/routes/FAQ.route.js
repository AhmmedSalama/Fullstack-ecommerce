const express = require("express");
const {
  getFAQs,
  addFAQ,
  updateFAQ,
  deleteFAQ,
} = require("../controllers/FAQ.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/", getFAQs);
router.post("/", authenticate, authorize("admin", "super-admin"), addFAQ);
router.put("/:id", authenticate, authorize("admin", "super-admin"), updateFAQ);
router.delete("/:id", authenticate, authorize("admin", "super-admin"), deleteFAQ);

module.exports = router;
