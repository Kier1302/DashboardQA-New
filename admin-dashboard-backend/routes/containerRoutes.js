const express = require('express');
const router = express.Router();
const Container = require('../models/Container');

/* GET /api/containers - Get containers authorized for the user or all if no email */
router.get('/', async (req, res) => {
  try {
    let userEmail = req.query.email;
    console.log("GET /api/containers called with email:", userEmail);
    if (userEmail) {
      userEmail = userEmail.trim().toLowerCase();
    }
    let containers;
    if (userEmail) {
      containers = await Container.find({ authorizedUsers: { $in: [userEmail] } });
      console.log(`Containers found for ${userEmail}:`, containers.map(c => c.name));
    } else {
      containers = await Container.find();
      console.log("Containers found (no email filter):", containers.map(c => c.name));
    }
    res.json(containers);
  } catch (error) {
    console.error("Error in GET /api/containers:", error);
    res.status(500).json({ message: 'Server error fetching containers' });
  }
});

/* POST /api/containers - Create a new container */
router.post('/', async (req, res) => {
  const { name, parent } = req.body;
  if (!name) {
    return res.status(400).json({ message: 'Container name is required' });
  }
  try {
    const existing = await Container.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Container name already exists' });
    }
    const container = new Container({ name, parent: parent || null, authorizedUsers: [] });
    await container.save();
    res.status(201).json(container);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating container' });
  }
});

/* GET /api/containers/:parentId/subcontainers - Get sub-containers for a parent */
router.get('/:parentId/subcontainers', async (req, res) => {
  try {
    const { parentId } = req.params;
    const subcontainers = await Container.find({ parent: parentId });
    res.json(subcontainers);
  } catch (error) {
    console.error("Error fetching sub-containers:", error);
    res.status(500).json({ message: 'Server error fetching sub-containers' });
  }
});

const Requirement = require('../models/Requirement');

// DELETE /api/containers/:id - Delete a container by id and its associated requirements and sub-containers
router.delete('/:id', async (req, res) => {
  try {
    const container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ message: 'Container not found' });
    }

    // Recursive function to delete container and its sub-containers
    const deleteContainerRecursively = async (containerId) => {
      const subContainers = await Container.find({ parent: containerId });
      for (const sub of subContainers) {
        await deleteContainerRecursively(sub._id);
      }
      // Delete requirements for this container
      await Requirement.deleteMany({ container: (await Container.findById(containerId)).name });
      // Delete the container
      await Container.findByIdAndDelete(containerId);
    };

    await deleteContainerRecursively(req.params.id);

    res.json({ message: 'Container, sub-containers, and associated requirements deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting container' });
  }
});

// POST /api/containers/:id/authorize - Replace authorized user emails for a container
router.post('/:id/authorize', async (req, res) => {
  let { emails } = req.body; // array of emails
  if (!emails || !Array.isArray(emails)) {
    return res.status(400).json({ message: 'Emails array is required' });
  }
  try {
    const container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ message: 'Container not found' });
    }
    // Normalize emails to lowercase and trim whitespace
    emails = emails.map(email => email.trim().toLowerCase());
    // Replace authorizedUsers with provided emails
    container.authorizedUsers = emails;
    await container.save();
    res.json(container);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating authorized users' });
  }
});

// DELETE /api/containers/:id/authorize - Remove authorized user emails from a container
router.delete('/:id/authorize', async (req, res) => {
  const { emails } = req.body; // array of emails
  if (!emails || !Array.isArray(emails)) {
    return res.status(400).json({ message: 'Emails array is required' });
  }
  try {
    const container = await Container.findById(req.params.id);
    if (!container) {
      return res.status(404).json({ message: 'Container not found' });
    }
    container.authorizedUsers = container.authorizedUsers.filter(email => !emails.includes(email));
    await container.save();
    res.json(container);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating authorized users' });
  }
});

module.exports = router;
