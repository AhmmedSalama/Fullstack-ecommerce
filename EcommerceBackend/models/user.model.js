const mng = require("mongoose");
const bcrypt = require("bcrypt");

// Schemas
const addressSchema = new mng.Schema({
  street: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  governorate: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
});

const phoneSchema = new mng.Schema({
  number: { type: String, required: true, trim: true },
  isDefault: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
});

const userSchema = new mng.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          const VALID_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return VALID_EMAIL_REGEX.test(v);
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      validate: {
        validator: function (v) {
          const STRONG_PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
          return STRONG_PASSWORD_REGEX.test(v);
        },
        message: () =>
          `Password must be at least 8 characters and includes at least one uppercase letter, one lowercase letter, and one number.`,
      },
    },
    role: {
      type: String,
      enum: ["user", "admin", "super-admin"],
      default: "user",
    },
    phones: [phoneSchema],
    addresses: [addressSchema],
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Hashing Password when create or update user
userSchema.pre("save", function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 12);
  next();
});
userSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (!update.password && !(update.$set && update.$set.password)) {
    return next();
  }
  const password = update.password || update.$set.password;
  const hashedPassword = bcrypt.hashSync(password, 12);
  if (update.password) {
    update.password = hashedPassword;
  } else {
    update.$set.password = hashedPassword;
  }
  next();
});

// Make method inside the user to compare password
userSchema.methods.isCorrectPassword = function (pass) {
  return bcrypt.compareSync(pass, this.password);
};

module.exports = mng.model("User", userSchema);
