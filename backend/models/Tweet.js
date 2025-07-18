// backend/models/Tweet.js
const mongoose = require('mongoose');

const tweetSchema = new mongoose.Schema({
  tweetId: {
    type: String,
    required: true,
    unique: true,
  },
  handle: String,
  text: String,
  url: String,
  timestamp: Date,
  media: [String],
  qrCode: String,
   isDisplayed: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Tweet', tweetSchema);
