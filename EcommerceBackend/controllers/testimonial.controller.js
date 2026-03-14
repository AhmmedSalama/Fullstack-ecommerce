const Testimonial = require("../models/testimonial.model");

// GET ALL Non-approved
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      isDeleted: false,
      isApproved: false,
    }).populate("user", "name");
    return res
      .status(200)
      .json({ message: `Testimonials List`, data: testimonials });
  } catch (err) {
    console.log(`Error In getTestimonials(): ${err.message}`);
    return res.status(500).json({ message: "Getting Testimonials failed" });
  }
};

// GET ALL Approved
exports.getApprovedTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({
      isDeleted: false,
      isApproved: true,
    }).populate("user", "name");
    return res
      .status(200)
      .json({ message: `Approved Testimonials List`, data: testimonials });
  } catch (err) {
    console.log(`Error In getApprovedTestimonials(): ${err.message}`);
    return res
      .status(500)
      .json({ message: "Getting Approved Testimonials failed" });
  }
};

// Post
exports.addTestimonial = async (req, res) => {
  try {
    const { message, rating } = req.body;
    const userId = req.user._id;
    const testimonial = await Testimonial.create({
      user: userId,
      message,
      rating,
    });
    return res.status(201).json({
      message: `Testimonial created successfully wait for admin's approval`,
      data: testimonial,
    });
  } catch (err) {
    console.log(`Error In addTestimonial(): ${err.message}`);
    return res.status(500).json({ message: "Testimonial creation failed" });
  }
};

// Put
exports.approveTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    return res.status(200).json({
      message: `Testimonial approved successfully`,
      data: testimonial,
    });
  } catch (err) {
    console.log(`Error In approveTestimonial(): ${err.message}`);
    return res.status(500).json({ message: "Approving Testimonial failed" });
  }
};

// Delete
exports.deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true },
      { new: true }
    );
    return res
      .status(200)
      .json({ message: `Testimonial deleted successfully`, data: testimonial });
  } catch (err) {
    console.log(`Error In deleteTestimonial(): ${err.message}`);
    return res.status(500).json({ message: "Deleting Testimonial failed" });
  }
};
