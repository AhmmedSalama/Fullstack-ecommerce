const mng = require("mongoose");

const testimonialSchema = new mng.Schema(
  {
    user: {
      type: mng.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    isApproved: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mng.model("Testimonial", testimonialSchema);
