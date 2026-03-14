const FAQ = require("../models/FAQ.model");

// GET ALL
exports.getFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find({ isDeleted: false });
    return res.status(200).json({ message: `FAQs List`, data: faqs });
  } catch (err) {
    console.log(`Error In getFAQs(): ${err.message}`);
    return res.status(500).json({ message: "Getting FAQs failed" });
  }
};

// Post
exports.addFAQ = async (req, res) => {
  try {
    let { question, answer } = req.body;
    question += "?";
    const isExists = await FAQ.findOne({ question });
    if (isExists) {
      return res.status(400).json({ message: "Question is already exists" });
    }
    const faq = await FAQ.create({ question, answer });
    return res
      .status(201)
      .json({ message: `FAQ created successfully`, data: faq });
  } catch (err) {
    console.log(`Error In addFAQ(): ${err.message}`);
    return res.status(500).json({ message: "FAQ creation failed" });
  }
};

// Put
exports.updateFAQ = async (req, res) => {
  try {
    let { question, answer } = req.body;
    question += "?";
    const isExists = await FAQ.findOne({ question });
    if (isExists) {
      return res.status(400).json({ message: "Question is already exists" });
    }
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { question, answer },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: `FAQ updated successfully`, data: faq });
  } catch (err) {
    console.log(`Error In updateFAQ(): ${err.message}`);
    return res.status(500).json({ message: "Updating FAQ failed" });
  }
};

// Delete
exports.deleteFAQ = async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: `FAQ deleted successfully`, data: faq });
  } catch (err) {
    console.log(`Error In deleteFAQ(): ${err.message}`);
    return res.status(500).json({ message: "Deleting FAQ failed" });
  }
};
