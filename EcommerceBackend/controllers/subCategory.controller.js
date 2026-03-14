const SubCategory = require("../models/subCategory.model");

// Get
exports.getSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ isDeleted: false }).populate(
      "parentCategory",
      "name"
    );
    return res.status(200).json({
      message: `Sub-Categories list`,
      data: subCategories,
    });
  } catch (err) {
    console.log(`Error In getSubCategories(): ${err.message}`);
    return res.status(500).json({ message: "Getting Sub-Categories failed" });
  }
};

// Post
exports.addSubCategory = async (req, res) => {
  try {
    const { name, parentId } = req.body;
    const isExists = await SubCategory.findOne({ name });
    if (isExists) {
      return res
        .status(400)
        .json({ message: "Sub-Category is already exists" });
    }
    const category = await SubCategory.create({
      name,
      parentCategory: parentId,
    });
    return res.status(201).json({
      message: `${category.name} Sub-Category created successfully`,
      data: category,
    });
  } catch (err) {
    console.log(`Error In addSubCategory(): ${err.message}`);
    return res.status(500).json({ message: "Sub-Category creation failed" });
  }
};

// Put
exports.updateSubCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const isExists = await SubCategory.findOne({ name });
    if (isExists) {
      return res
        .status(400)
        .json({ message: "Sub-Category is already exists" });
    }
    const category = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    return res.status(200).json({
      message: `${category.name} Sub-Category updated successfully`,
      data: category,
    });
  } catch (err) {
    console.log(`Error In changeName(): ${err.message}`);
    return res.status(500).json({ message: "Updating Sub-Category failed" });
  }
};

// Delete
exports.deleteSubCategory = async (req, res) => {
  try {
    const category = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).json({
      message: `${category.name} Sub-Category deleted successfully`,
      data: category,
    });
  } catch (err) {
    console.log(`Error In deleteSubCategory(): ${err.message}`);
    return res.status(500).json({ message: "Deleting Sub-Category failed" });
  }
};
