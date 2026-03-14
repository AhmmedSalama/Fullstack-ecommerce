const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No Token Provided" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decode = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decode.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(`Error in authenticate(): ${err.message}`);
    return res.status(403).json({ message: "unauthenticated: user unknown" });
  }
};

exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: "unauthorized: access denied" });
    }
    next();
  };
};
