// backend/models/Handle.js
const mongoose = require('mongoose');

const handleSchema = new mongoose.Schema({
  // Update Handle model: add userId field
// models/Handle.js
userId: { type: String, required: false },

  username: {
    type: String,
    required: true,
    unique: true,
  },
  validated: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Handle', handleSchema);
