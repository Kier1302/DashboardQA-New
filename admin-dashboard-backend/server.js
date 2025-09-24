require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const fileRoutes = require("./routes/files"); // Added File Management Routes
const requirementRoutes = require('./routes/requirementRoutes');
const containerRoutes = require('./routes/containerRoutes');

const app = express();

// Middleware
app.use(express.json());

// Add your frontend URL here
const FRONTEND_URL = "https://visionary-sunflower-a57963.netlify.app";

// Configure CORS options
const corsOptions = {
  origin: FRONTEND_URL, // Allow requests from the frontend domain
  credentials: true,    // If you are using cookies or authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow all common HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow necessary headers
};

// Apply CORS middleware
app.use(cors(corsOptions));


// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/files", require("./routes/files"));
app.use('/api/requirements', requirementRoutes); // Add this line
app.use('/api/containers', containerRoutes); // Add container routes

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1); // Stop server if DB connection fails
  });

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
