const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;

const router = express.Router();

// Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// New endpoint to get current user details
router.get("/me", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from header
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token
    const user = await User.findById(decoded.id).select("-password"); // Fetch user without password
    if (!user) return res.status(404).json({ message: "User not found" });

    // Include email explicitly in response
    res.json({
      id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
      // add other fields if needed
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// New endpoint to check if user email exists
router.get("/exists", async (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ message: "Email query parameter is required" });
  }
  try {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    res.json({ exists: !!user });
  } catch (error) {
    console.error("Error checking user email existence:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
