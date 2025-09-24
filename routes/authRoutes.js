router.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: "Invalid email or password" });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });
  
      const token = jwt.sign(
        { id: user._id, role: user.role }, // Include role in token
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
  
      res.status(200).json({ token, role: user.role }); // Send role to frontend
  
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  