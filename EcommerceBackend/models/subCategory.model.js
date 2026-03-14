const mng = require("mongoose");

const subCategorySchema = new mng.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    parentCategory: {
      type: mng.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mng.model("SubCategory", subCategorySchema);
