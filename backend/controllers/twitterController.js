// Import required modules
const axios = require('axios'); // For making HTTP requests to Twitter API
const Tweet = require('../models/Tweet'); // Mongoose model for Tweet schema
const Handle = require('../models/Handle'); // Mongoose model for Twitter handle schema
const QRCode = require('qrcode'); // Library to generate QR codes

// Load Twitter Bearer Token from environment variables
const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// ─────────────────────────────────────────────────────────
//  Step 1: Get Twitter User ID from Handle
// ─────────────────────────────────────────────────────────
const getUserIdFromHandle = async (handle) => {
  const response = await axios.get(
    `https://api.twitter.com/2/users/by/username/${handle}`,
    {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    }
  );
  return response.data.data.id; // Return user ID
};

// ─────────────────────────────────────────────────────────
//  Step 2: Fetch Tweets using User ID
// ─────────────────────────────────────────────────────────
const fetchTweetsFromHandle = async (handleObj) => {
  try {
    // Wait 2.1 seconds to respect Twitter rate limits
    await new Promise((r) => setTimeout(r, 2100));

    const userId = handleObj.userId;
    if (!userId) {
      console.warn(`Skipping ${handleObj.username} — missing userId.`);
      return []; // Skip handles without a valid userId
    }

    // Call Twitter API to fetch recent tweets
    const response = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,attachments&expansions=attachments.media_keys&media.fields=url`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    console.log(`✅ Fetching tweets for ${handleObj.username} (ID: ${handleObj.userId})`);

    const tweets = response.data.data || [];
    const media = response.data.includes?.media || [];

    // Map the tweet data into our database-friendly format
    return tweets.map((tweet) => {
      const tweetMedia = media.find(
        (m) => m.media_key === tweet.attachments?.media_keys?.[0]
      );

      return {
        tweetId: tweet.id,
        handle: handleObj.username,
        text: tweet.text,
        url: `https://x.com/${handleObj.username}/status/${tweet.id}`,
        timestamp: tweet.created_at,
        mediaUrl: tweetMedia?.url || null,
      };
    });

  } catch (error) {
    console.error(`Error fetching @${handleObj.username}:`, error.response?.data || error.message);
    return [];
  }
};

// ─────────────────────────────────────────────────────────
//  Fetch Tweets from All Validated Handles
// ─────────────────────────────────────────────────────────
const fetchTweetsFromAllHandles = async (req, res) => {
  const handles = await Handle.find({ validated: true }); // Get only validated handles
  let newTweets = [];

  for (let handleObj of handles) {
    const tweets = await fetchTweetsFromHandle(handleObj); // Fetch tweets from each handle

    for (let tweet of tweets) {
      // Avoid duplicate tweets by checking tweetId
      const exists = await Tweet.findOne({ tweetId: tweet.tweetId });

      if (!exists) {
        const qrCode = await QRCode.toDataURL(tweet.url); // Generate QR code for tweet URL
        tweet.qrCode = qrCode;

        const saved = await Tweet.create(tweet); // Save tweet to DB
        newTweets.push(saved);
      }
    }
  }

  res.status(200).json({ newTweets }); // Return newly added tweets
};

// ─────────────────────────────────────────────────────────
//  Get Next Tweet to Display
// ─────────────────────────────────────────────────────────
const getNextTweetToDisplay = async (req, res) => {
  try {
    // Find the first tweet that hasn't been displayed yet
    const tweet = await Tweet.findOne({ isDisplayed: false }).sort({ timestamp: 1 });

    if (!tweet) {
      return res.status(404).json({ message: 'No new tweets to display.' });
    }

    tweet.isDisplayed = true; // Mark it as displayed
    await tweet.save();

    res.status(200).json(tweet); // Send tweet data to frontend
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching next tweet.' });
  }
};

// ─────────────────────────────────────────────────────────
//  Validate Twitter Handle and Save userId
// ─────────────────────────────────────────────────────────
const validateHandle = async (req, res) => {
  const { username } = req.body;

  try {
    // Call Twitter API to get userId from username
    const response = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    const twitterUserId = response.data.data.id;

    // Check if handle already exists in DB
    let handle = await Handle.findOne({ username });

    if (!handle) {
      // Create new handle document
      handle = new Handle({
        username,
        validated: true,
        userId: twitterUserId,
      });
    } else {
      // Update existing handle if needed
      handle.validated = true;
      if (!handle.userId) {
        handle.userId = twitterUserId; // Update only if missing
      }
    }

    await handle.save(); // Save handle to DB

    res.status(200).json({ message: 'Handle validated and saved.', handle });
  } catch (error) {
    res.status(400).json({
      message: 'Invalid Twitter handle or not found.',
      error: error.response?.data || error.message,
    });
  }
};

// ─────────────────────────────────────────────────────────
// Export all controller functions
// ─────────────────────────────────────────────────────────
module.exports = {
  fetchTweetsFromHandle,
  fetchTweetsFromAllHandles,
  getNextTweetToDisplay,
  validateHandle,
};
