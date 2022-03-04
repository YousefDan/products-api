const mongoose = require("mongoose");
const joi = require("joi");

// ProductSchema
const ProductSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 70,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  photo: {
    type: String,
    default: "",
  },
});
// Product Model
const Product = mongoose.model("Product", ProductSchema);
// Validate Create Product
function validateCreateProduct(product) {
  const schema = joi.object({
    title: joi.string().trim().min(5).max(70).required(),
    description: joi.string().trim().min(10).required(),
    price: joi.number().min(0).required(),
    photo: joi.string(),
  });
  return schema.validate(product);
}
// Validate Update Product
function validateUpdateProduct(product) {
  const schema = joi.object({
    title: joi.string().trim().min(5).max(70),
    description: joi.string().trim().min(10),
    price: joi.number().min(0),
    photo: joi.string(),
  });
  return schema.validate(product);
}

module.exports = {
  Product,
  validateCreateProduct,
  validateUpdateProduct,
};
