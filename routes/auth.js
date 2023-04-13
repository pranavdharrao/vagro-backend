const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const fetchUser = require("../middleware/fetchUser");
const dotenv = require("dotenv");

const jwtkey = process.env.JWT_SECRET_KEY;


// ROUTE 1: Create a User using: POST "/api/auth/createuser". No login required
router.post('/createuser', [
  body('name', 'Enter a valid name').isLength({ min: 3 }),
  body('email', 'Enter a valid email').isEmail(),
  body(
    "password",
    "Password must have one capital, one small, one symbol and one number at least"
  ).isStrongPassword(),
  
], async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // To check whether the user with this email exists already
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).json({ error: "Sorry a user with this email already exists" })
    }
    const salt = await bcrypt.genSalt(10);
    const securedPassword = await bcrypt.hash(req.body.password, salt);

    // Create a new user
    user = await User.create({
      name: req.body.name,
      password: securedPassword,
      email: req.body.email
    });
    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, jwtkey);


    // res.json(user)
    res.json({ authtoken })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 2: Authenticate a User using: POST "/api/auth/login". Login with email
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body(
    "password",
    "Password must have one capital, one small, one symbol and one number at least"
  ).isStrongPassword(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false
      return res.status(400).json({ error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    //generating login token
    let token;
    if (req.body.remember) {
      token = jwt.sign({ userId: user.id }, jwtkey);
    } else {
      token = jwt.sign({ userId: user.id }, jwtkey, { expiresIn: "10m" });
    }
    //sending token
    res.cookie("token", token, { maxAge: 600000 });
    res.cookie("loggedInTime", Date.now(), { maxAge: 600000 });
    res.cookie("isEmailVerified", user.isEmailVerified);
    res.json({
      token,
      isEmailVerified: user.isEmailVerified,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Bad Request" });
  }

});


// ROUTE 3: Get loggedin User Details using: POST "/api/auth/getuser". Login required

router.post('/getuser', fetchUser,  async (req, res) => {

  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password")
    res.send(user)
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }
})


// ROUTE 4: logout User using: POST "/api/auth/logout".

router.post("/logout", fetchUser, async (req, res) => {
  try {
    console.log("User Logout by: " + req.user);
    res.clearCookie("token");
    res.clearCookie("loggedInTime");
    res.clearCookie("isEmailVerified");
    res.json({ message: "Logged out User" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;