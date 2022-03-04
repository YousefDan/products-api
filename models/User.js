const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");

// UserSchema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 70,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 110,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minlength: 8,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});
// Generate Token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET
  );
};
// User Model
const User = mongoose.model("User", UserSchema);
// Validate Register User
function validateRegisterUser(User) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(70).required(),
    email: joi.string().trim().min(5).max(110).required().email(),
    password: joi.string().trim().min(8).required(),
    isAdmin: joi.boolean(),
  });
  return schema.validate(User);
}
// Validate Login User
function validateLoginUser(User) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(70).required(),
    password: joi.string().trim().min(8).required(),
  });
  return schema.validate(User);
}
// Validate Update User
function validateUpdateUser(User) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(70),
    email: joi.string().trim().min(5).max(110).email(),
    password: joi.string().trim().min(8),
    isAdmin: joi.boolean(),
  });
  return schema.validate(User);
}

module.exports = {
  User,
  validateRegisterUser,
  validateUpdateUser,
  validateLoginUser,
};
