const router = require("express").Router();
const _ = require("lodash");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { User, validateRegisterUser, validateLoginUser } = require("../models/User");

/**
 *   @desc     Register a new user
 *   @route    /api/auth/register
 *   @method   POST
 *   @access   public
 */
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { error } = validateRegisterUser(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    let user = await User.findOne({ username: req.body.username });
    if (user) {
      return res.status(400).send("this user is already exist");
    }

    user = new User(
      _.pick(req.body, ["username", "email", "password", "isAdmin"])
    );

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);

    await user.save();

    const token = user.generateAuthToken();

    const { password, __v, ...other } = user._doc;
    res.status(201).send({ ...other, token });
  })
);

/**
 *   @desc     Login a user
 *   @route    /api/auth/login
 *   @method   POST
 *   @access   public
 */
 router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const { error } = validateLoginUser(req.body);
      if (error) {
        return res.status(400).send(error.details[0].message);
      }
  
      let user = await User.findOne({ username: req.body.username });
      if (!user) {
        return res.status(400).send("invalid username or password");
      }
  
      const isPasswordMatch = await bcrypt.compare(req.body.password, user.password);
      if(!isPasswordMatch) {
        return res.status(400).send("invalid username or password");
      }
  
      const token = user.generateAuthToken();
  
      const { password, __v, ...other } = user._doc;
      res.status(200).send({ ...other, token });
    })
  );

module.exports = router;
