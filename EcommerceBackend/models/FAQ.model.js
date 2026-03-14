const mng = require("mongoose");

const faqSchema = new mng.Schema(
  {
    question: { type: String, required: true, unique: true, trim: true },
    answer: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

module.exports = mng.model("FAQ", faqSchema);
