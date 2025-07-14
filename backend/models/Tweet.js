const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  tweetId: { type: String, required: true, unique: true },
  handle: { type: String, required: true },
  content: { type: String },
  displayed: { type: Boolean, default: false }
});

module.exports = mongoose.model('Tweet', tweetSchema);