const mng = require("mongoose");
const SubCategory = require("./subCategory.model");

// Schema
const categorySchema = new mng.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// delete the sub-categories of the deleted category
categorySchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.isDeleted === true) {
    const categoryId = this.getQuery()._id;
    await SubCategory.updateMany(
      { parentCategory: categoryId },
      { $set: { isDeleted: true } }
    );
  }
  next();
});

module.exports = mng.model("Category", categorySchema);
