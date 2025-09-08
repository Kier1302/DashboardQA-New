const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ["file", "link"], required: true },
  url: String, // Stores link or file URL
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("File", FileSchema);
