// models/Requirement.js
const mongoose = require('mongoose');

const RequirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true, // Ensure the name is always required
  },
  description: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    enum: ["file", "url"],
    default: "file",
  },
  container: {
    type: String,
    required: true,
  },
});

const Requirement = mongoose.model('Requirement', RequirementSchema);
module.exports = Requirement;
