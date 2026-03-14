const Product = require("../models/product.model");
const SubCategory = require("../models/subCategory.model");
const fs = require("node:fs");

// GET ALL
exports.getProducts = async (req, res) => {
  try {
    // get Queries
    let {
      page = 1,
      limit = 10,
      search,
      category,
      subCategory,
      minPrice,
      maxPrice,
      sortBy,
    } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    // Make filteration query
    const query = { isDeleted: false };
    if (search) {
      query.$text = { $search: search };
    }
    if (category) {
      query.category = category;
    }
    if (subCategory) {
      query.subCategory = subCategory;
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    // Make sort options
    let sortOption = {};
    if (sortBy) {
      sortOption[sortBy.replace("-", "")] = sortBy.startsWith("-") ? -1 : 1;
    } else if (search) {
      // sort by most relevance
      sortOption = { score: { $meta: "textScore" } };
    } else {
      // sort by newest
      sortOption = { createdAt: -1 };
    }
    // Count the total docs result
    const total = await Product.countDocuments(query);
    const products = await Product.find(
      query,
      search ? { score: { $meta: "textScore" } } : {}
    )
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category subCategory", "name");
    return res.status(200).json({
      message: "Get your Products",
      data: products,
      meta: {
        total,
        page,
        pages: Math.ceil(total / limit),
        limit,
      },
    });
  } catch (err) {
    console.error(`Error In getProducts(): ${err.message}`);
    return res.status(500).json({ message: "Getting Products failed" });
  }
};

// Get by slug
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate(
      "category subCategory",
      "name"
    );
    if (!product || product.isDeleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({
      message: "Get your Product",
      data: product,
    });
  } catch (err) {
    console.error(`Error In getProductBySlug(): ${err.message}`);
    return res.status(500).json({ message: "Getting Product failed" });
  }
};

// Get by id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id }).populate(
      "category subCategory",
      "name"
    );
    if (!product || product.isDeleted) {
      return res.status(404).json({ error: "Product not found" });
    }
    return res.status(200).json({
      message: "Get your Product",
      data: product,
    });
  } catch (err) {
    console.error(`Error In getProductById(): ${err.message}`);
    return res.status(500).json({ message: "Getting Product failed" });
  }
};

// Post
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price, stock, subCategoryId } = req.body;
    const image = req.file.filename;
    const subCategory = await SubCategory.findById(subCategoryId);
    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category: subCategory.parentCategory,
      subCategory: subCategoryId,
      image,
    });
    return res.status(201).json({
      message: `Product created successfully`,
      data: product,
    });
  } catch (err) {
    console.log(`Error In addProduct(): ${err.message}`);
    return res.status(500).json({ message: "Product creation failed" });
  }
};

// Put
exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, stock, subCategoryId } = req.body;
    const image = req.file?.filename;
    const subCategory = await SubCategory.findById(subCategoryId);
    if (image) {
      const { image: prevImage } = await Product.findById(req.params.id);
      const path = `uploads/${prevImage}`;
      if (fs.existsSync(path)) {
        fs.rm(path, (err) => {
          if (err) console.log(`Error in deleting prevImage: ${err.message}`);
        });
      }
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        stock,
        category: subCategory?.parentCategory,
        subCategory: subCategoryId,
        image,
      },
      { new: true }
    );
    return res.status(200).json({
      message: `Product updated successfully`,
      data: product,
    });
  } catch (err) {
    console.log(`Error In updateProduct(): ${err.message}`);
    return res.status(500).json({ message: "Updating Product failed" });
  }
};

// Delete
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    return res.status(200).json({
      message: `Product deleted successfully`,
      data: product,
    });
  } catch (err) {
    console.log(`Error In deleteProduct(): ${err.message}`);
    return res.status(500).json({ message: "Deleting Product failed" });
  }
};
