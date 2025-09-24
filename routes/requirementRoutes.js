// routes/requirementRoutes.js
const express = require('express');
const Requirement = require('../models/Requirement');
const File = require('../models/File');
const router = express.Router();

// GET route to fetch all requirements, optionally filtered by container
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.container) {
      filter.container = req.query.container;
    }
    const requirements = await Requirement.find(filter);
    return res.status(200).json(requirements);
  } catch (error) {
    console.error("Error fetching requirements:", error);
    return res.status(500).json({ message: 'Failed to fetch requirements' });
  }
});

// POST route to save multiple requirements
router.post('/', async (req, res) => {
  try {
    const { requirements, container } = req.body;

    // Validate if all requirements have a valid name
    if (!requirements || !Array.isArray(requirements)) {
      return res.status(400).json({ message: 'Requirements must be an array.' });
    }
    if (!container) {
      return res.status(400).json({ message: 'Container is required.' });
    }

    const savedRequirements = [];
    for (let req of requirements) {
      if (!req.name.trim()) {
        return res.status(400).json({ message: 'Requirement name cannot be empty.' });
      }
      const newRequirement = new Requirement({ 
        name: req.name,
        description: req.description || "",
        type: req.type || "file",
        container: container
      });
      const saved = await newRequirement.save();
      savedRequirements.push(saved);
    }

    return res.status(200).json({ message: 'Requirements saved successfully!', data: savedRequirements });
  } catch (error) {
    console.error("Error saving requirements:", error);
    return res.status(500).json({ message: 'Failed to save requirements' });
  }
});

const fs = require("fs");
const path = require("path");

router.delete('/:id', async (req, res) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ message: 'Requirement not found' });
    }
    // Find all files associated with this requirement name
    const files = await File.find({ name: requirement.name });

    // Delete physical files from disk for files of type "file"
    for (const file of files) {
      if (file.type === "file" && file.url) {
        const relativePath = file.url.split("/uploads/")[1];
        if (relativePath) {
          const filePath = path.join(__dirname, "../uploads", relativePath);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    // Delete file documents from database
    await File.deleteMany({ name: requirement.name });

    // Delete the requirement itself
    await Requirement.deleteOne({ _id: req.params.id });

    return res.status(200).json({ message: 'Requirement and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    return res.status(500).json({ message: 'Failed to delete requirement' });
  }
});

router.delete('/container/:containerName', async (req, res) => {
  try {
    const containerName = req.params.containerName;
    const result = await Requirement.deleteMany({ container: containerName });
    return res.status(200).json({ message: `Deleted ${result.deletedCount} requirements for container ${containerName}` });
  } catch (error) {
    console.error('Error deleting requirements for container:', error);
    return res.status(500).json({ message: 'Failed to delete requirements for container' });
  }
});

module.exports = router;
