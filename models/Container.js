const mongoose = require('mongoose');

const containerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Container',
    default: null,
  },
  authorizedUsers: {
    type: [String], // array of user emails
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Container', containerSchema);
