const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const File = require("../models/File");

const router = express.Router();

// 🔹 Ensure "uploads" directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔹 Multer Setup for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 🔹 File Filter for Type Validation
// Removed file type restriction to allow any kind of document
const fileFilter = (req, file, cb) => {
  cb(null, true);
};

// 🔹 Multer Instance with Size Limitation (10MB) and File Type Validation
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter,
});

// 🔹 Upload File or Link
router.post("/upload", upload.single("file"), async (req, res) => {
  console.log("Incoming upload request body:", req.body);
  console.log("Incoming upload request file:", req.file);

  try {
    const { name, type, url } = req.body;

    // ✅ Validate required fields
    if (!name || !type) {
      console.error("⚠️ Missing required fields: name or type");
      return res.status(400).json({ message: "⚠️ Name and Type are required" });
    }

    let fileData = { name, type, url, status: "pending" }; // Default status

    if (type === "file") {
      if (!req.file) {
        console.error("⚠️ File is missing in request");
        return res.status(400).json({ message: "⚠️ File is missing" });
      }
      fileData.url = `/uploads/${req.file.filename}`;
    }

    // ✅ Avoid duplicate uploads
    const existingFile = await File.findOne({ name, url });
    if (existingFile) {
      console.error("⚠️ File already exists");
      return res.status(400).json({ message: "⚠️ File already exists" });
    }

    const newFile = new File(fileData);
    await newFile.save();

    console.log("✅ File Uploaded:", newFile);
    res.status(201).json({ message: "✅ File uploaded successfully", file: newFile });
  } catch (error) {
    console.error("❌ Upload Error:", error.message);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// 🔹 Get All Uploaded Files
router.get("/", async (req, res) => {
  try {
    const files = await File.find();
    console.log("📂 Files Retrieved:", files);
    res.status(200).json(files);
  } catch (error) {
    console.error("❌ Fetch Files Error:", error.message);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// 🔹 Approve or Reject File
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "⚠️ Invalid status" });
    }

    const file = await File.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!file) return res.status(404).json({ message: "⚠️ File not found" });

    console.log(`✅ File ${status}:`, file);
    res.status(200).json({ message: `✅ File ${status}`, file });
  } catch (error) {
    console.error("❌ Update Status Error:", error.message);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

// 🔹 Delete File
router.delete("/:id", async (req, res) => {
  try {
    // Find the file in the database
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "⚠️ File not found" });

    // Only attempt physical deletion for uploaded files
    if (file.type === "file") {
      const relativePath = file.url?.split("/uploads/")[1];

      if (!relativePath) {
        console.error("❌ File URL is invalid or missing:", file.url);
        return res.status(400).json({ message: "❌ Invalid file URL" });
      }

      const filePath = path.join(__dirname, "../uploads", relativePath);
      console.log("🔹 Deleting file at path:", filePath);

      if (fs.existsSync(filePath)) {
        console.log("✅ File exists, deleting...");
        fs.unlinkSync(filePath);
      } else {
        console.warn("⚠️ File not found on disk, skipping physical deletion.");
      }
    }

    // Delete the file record from the database
    await File.findByIdAndDelete(req.params.id);

    console.log("🗑 File Deleted:", file);
    res.status(200).json({ message: "✅ File deleted successfully" });
  } catch (error) {
    console.error("❌ Delete Error:", error.message);
    res.status(500).json({ message: "❌ Server error", error: error.message });
  }
});

module.exports = router;
