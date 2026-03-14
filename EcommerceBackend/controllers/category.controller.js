const Category = require("../models/category.model");
const SubCategory = require("../models/subCategory.model");

// GET ALL
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isDeleted: false });
    const data = await Promise.all(
      categories.map(async (category) => {
        const subCategories = await SubCategory.find({
          isDeleted: false,
          parentCategory: category._id,
        }).select("name");
        return {
          _id: category._id,
          name: category.name,
          subCategories,
        };
      })
    );
    return res.status(200).json({
      message: "Get your Categories",
      data,
    });
  } catch (err) {
    console.error(`Error In getCategories(): ${err.message}`);
    return res.status(500).json({ message: "Getting Categories failed" });
  }
};

// Post
exports.addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const isExists = await Category.findOne({ name });
    if (isExists) {
      return res.status(400).json({ message: "Category is already exists" });
    }
    const category = await Category.create({ name });
    return res.status(201).json({
      message: `${category.name} Category created successfully`,
      data: category,
    });
  } catch (err) {
    console.log(`Error In addCategory(): ${err.message}`);
    return res.status(500).json({ message: "Category creation failed" });
  }
};

// Put
exports.updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const isExists = await Category.findOne({ name });
    if (isExists) {
      return res.status(400).json({ message: "Category is already exists" });
    }
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    return res.status(200).json({
      message: `${category.name} Category updated successfully`,
      data: category,
    });
  } catch (err) {
    console.log(`Error In updateCategory(): ${err.message}`);
    return res.status(500).json({ message: "Updating Category failed" });
  }
};

// Delete
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).json({
      message: `${category.name} Category deleted successfully`,
      data: category,
    });
  } catch (err) {
    console.log(`Error In deleteCategory(): ${err.message}`);
    return res.status(500).json({ message: "Deleting Category failed" });
  }
};
