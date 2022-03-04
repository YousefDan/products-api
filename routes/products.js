const router = require("express").Router();
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const {
  Product,
  validateCreateProduct,
  validateUpdateProduct,
} = require("../models/Product");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const { default: mongoose } = require("mongoose");

/**
 *   @desc     Get all products
 *   @route    /api/products
 *   @method   GET
 *   @access   public
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const products = await Product.find().select("-__v");
    res.status(200).send(products);
  })
);
/**
 *   @desc     Get a product
 *   @route    /api/products/:id
 *   @method   GET
 *   @access   public
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).send("product not found");
    }
    const product = await Product.findById(req.params.id).select("-__v");
    if (product) {
      res.status(200).send(product);
    } else {
      res.status(404).send("product not found");
    }
  })
);
/**
 *   @desc     Delete a product
 *   @route    /api/products/:id
 *   @method   DELETE
 *   @access   private only admin
 */
router.delete(
  "/:id",
  verifyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).send("product has been deleted");
  })
);

/**
 *   @desc     Update a product
 *   @route    /api/products/:id
 *   @method   PUT
 *   @access   private only admin
 */
router.put(
  "/:id",
  verifyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const { error } = validateUpdateProduct(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: _.pick(req.body, ["title", "description", "price", "photo"]),
      },
      { new: true }
    );

    res.status(200).send(updatedProduct);
  })
);

/**
 *   @desc     Create a new product
 *   @route    /api/products
 *   @method   POST
 *   @access   private only admin
 */
router.post(
  "/",
  verifyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const { error } = validateCreateProduct(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const product = new Product(
      _.pick(req.body, ["title", "description", "price", "author"])
    );

    await product.save();

    const { __v, ...other } = product._doc;
    res.status(201).send(other);
  })
);

module.exports = router;
