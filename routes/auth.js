const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const Jwt = require("jsonwebtoken");
const JWT_SECRET = "Mydataissecure$authenticated";
const fetchUser = require("../middleware/fetchUser");

router.post(
  "/register",
  [
    body("fullname", "Please add fullName").isLength({ min: 3 }),
    body("contactno", "please add Proper number").isMobilePhone(),
    body("email", "Enter valid Email").isEmail().normalizeEmail(),
    body("address", "Enter Proper address").isLength({ min: 3 }),
    body("password", "Enter Valid Password")
      .isLength({ min: 5 })
      .matches(/\d/)
      .withMessage("must contain a number and Capital words"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        res.status(200).json({ result: "this user is already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        fullname: req.body.fullname,
        contactno: req.body.contactno,
        email: req.body.email,
        address: req.body.address,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = Jwt.sign(data, JWT_SECRET);

      res.send({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal Server error");
    }
  }
);

router.post(
  "/login",
  [
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        res.status(200).json({ error: "User credentials are not valid" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        success = false;
        return res.status(400).json({
          success,
          error: "Please try to login with correct credentials",
        });
      }
      const data = {
        user: {
          id: user.id,
        },
      };
      const authtoken = await Jwt.sign(data, JWT_SECRET);
      res.send({ authtoken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error");
    }
  }
);

router.post("/getuser", fetchUser, async (req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
