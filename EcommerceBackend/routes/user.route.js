const express = require("express");
const {
  getUsers,
  getUser,
  addUser,
  login,
  getUserById,
  updateUser,
  deleteUser,
  deleteUserById,
  getAllAdmins,
} = require("../controllers/user.controller");
const { authenticate, authorize } = require("../middlewares/auth.middleware");
const router = express.Router();

// get all users
router.get("/all", authenticate, authorize("admin", "super-admin"), getUsers);
// get all admins
router.get("/all/admins", authenticate, authorize("super-admin"), getAllAdmins);
// get loggedin user
router.get(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  getUser
);
// get user by id
router.get(
  "/:id",
  authenticate,
  authorize("admin", "super-admin"),
  getUserById
);
// add admin
router.post("/admin", authenticate, authorize("super-admin"), addUser("admin"));
// user register
router.post("/register", addUser("user"));
// user login
router.post("/login", login);
// edit loggedin user
router.put(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  updateUser
);
// delete loggedin user
router.delete(
  "/",
  authenticate,
  authorize("user", "admin", "super-admin"),
  deleteUser
);
// delete user by id
router.delete("/:id", authenticate, authorize("super-admin"), deleteUserById);

module.exports = router;
