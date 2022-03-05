const router = require("express").Router();
const _ = require("lodash");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/User");
const {
  verifyTokenAndAdmin,
  verifyTokenAndAuthorization,
} = require("../middlewares/verifyToken");

/**
 *   @desc     Get all users
 *   @route    /api/users
 *   @method   GET
 *   @access   private only admin
 */
router.get(
  "/",
  verifyTokenAndAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-__v -password");
    res.status(200).send(users);
  })
);
/**
 *   @desc     Get a user
 *   @route    /api/users/:id
 *   @method   GET
 *   @access   private only admin and user himself
 */
router.get(
  "/:id",
  verifyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-__v -password");
    if (user) {
      res.status(200).send(user);
    } else {
      res.status(404).send("user not found");
    }
  })
);
/**
 *   @desc     Delete a user
 *   @route    /api/users/:id
 *   @method   DELETE
 *   @access   private only admin and user himself
 */
router.delete(
  "/:id",
  verifyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).send("user has been deleted");
  })
);

/**
 *   @desc     Update a user
 *   @route    /api/users/:id
 *   @method   PUT
 *   @access   private only admin and user himself
 */
router.put(
  "/:id",
  verifyTokenAndAuthorization,
  asyncHandler(async (req, res) => {
    const { error } = validateUpdateUser(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: _.pick(req.body, ["username", "email", "password"]),
      },
      { new: true }
    );

    const { password, __v, ...other } = updatedUser._doc;
    res.status(200).send(other);
  })
);

module.exports = router;
