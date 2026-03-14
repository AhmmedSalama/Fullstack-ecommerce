const User = require("../models/user.model");
const jwt = require("jsonwebtoken");

// generate token
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false, role: "user" }).select(
      "-password"
    );
    res.status(200).json({ message: "Users List", data: users });
  } catch (err) {
    console.log(`Error In getUsers(): ${err.message}`);
    return res.status(500).json({ message: "Getting Users failed" });
  }
};

// get all admins
exports.getAllAdmins = async (req, res) => {
  try {
    const users = await User.find({ isDeleted: false, role: "admin" }).select(
      "-password"
    );
    res.status(200).json({ message: "Admins List", data: users });
  } catch (err) {
    console.log(`Error In getAllAdmins(): ${err.message}`);
    return res.status(500).json({ message: "Getting Admins failed" });
  }
};

// get loggedin user
exports.getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    if (!user || user.isDeleted) {
      return res.status(404).json({ message: "User Not Found" });
    }
    res.status(200).json({ message: "User Data", data: user });
  } catch (err) {
    console.log(`Error In getUser(): ${err.message}`);
    return res.status(500).json({ message: "Getting User failed" });
  }
};

// get user by ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user || user.isDeleted) {
      return res.status(404).json({ error: "User Not Found" });
    }
    res.status(200).json({ message: "User Data", data: user });
  } catch (err) {
    console.log(`Error In getUserById(): ${err.message}`);
    return res.status(500).json({ message: "Getting User failed" });
  }
};

// register or add admin
exports.addUser = (role) => {
  return async (req, res) => {
    role = role.toLowerCase();
    try {
      const { name, email, password, phones, addresses } = req.body;
      if (!["user", "admin"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        if (existingUser.isDeleted) {
          // return the user with the new data
          existingUser.name = name;
          existingUser.password = password;
          existingUser.role = role;
          existingUser.phones = phones;
          existingUser.addresses = addresses;
          existingUser.isDeleted = false;
          await existingUser.save();
          const token = signToken(existingUser);
          return res
            .status(201)
            .json({ message: `${role} created successfully`, data: { token } });
        }
        return res.status(400).json({ message: "Email is already exists" });
      }
      let user = await User.create({
        name,
        email,
        password,
        role,
        phones,
        addresses,
      });
      const token = signToken(user);
      return res
        .status(201)
        .json({ message: `${role} created successfully`, data: { token } });
    } catch (err) {
      console.log(`Error In addUser(): ${err.message}`);
      return res.status(500).json({ message: `${role} creation failed` });
    }
  };
};

// login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Incorrect email or password" });
    }
    if (!user.isCorrectPassword(password)) {
      return res.status(404).json({ message: "Incorrect email or password" });
    }
    const token = signToken(user);
    return res
      .status(200)
      .json({ message: "Loggedin successfully", data: { token } });
  } catch (err) {
    console.log(`Error In login(): ${err.message}`);
    return res.status(500).json({ message: "User Login failed" });
  }
};

// update loggedin user
exports.updateUser = async (req, res) => {
  try {
    const { name, email, password, phones, addresses } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        email,
        password,
        phones,
        addresses,
      },
      { new: true }
    ).select("-password");
    return res
      .status(200)
      .json({ message: "Your profile updated successfully", data: user });
  } catch (err) {
    console.log(`Error In updateUser(): ${err.message}`);
    return res.status(500).json({ message: "Updating User failed" });
  }
};

// delete loggedin user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user.role === "super-admin") {
      return res
        .status(400)
        .json({ message: "You can't delete the super admin" });
    }
    user.isDeleted = true;
    await user.save();
    return res
      .status(200)
      .json({ message: "User Deleted successfully", data: user });
  } catch (err) {
    console.log(`Error In deleteUser(): ${err.message}`);
    return res.status(500).json({ message: "Deleting User failed" });
  }
};

// delete by ID
exports.deleteUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (user.role === "super-admin") {
      return res
        .status(400)
        .json({ message: "You can't delete the super admin" });
    }
    user.isDeleted = true;
    await user.save();
    return res
      .status(200)
      .json({ message: `${user.role} Deleted successfully`, data: user });
  } catch (err) {
    console.log(`Error In deleteUserById(): ${err.message}`);
    return res.status(500).json({ message: "Deleting User failed" });
  }
};
