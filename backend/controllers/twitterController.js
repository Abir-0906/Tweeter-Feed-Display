// backend/controllers/twitterController.js
const axios = require('axios');
const Tweet = require('../models/Tweet');

const QRCode = require('qrcode');
const Handle = require('../models/Handle.js');

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

const fetchTweetsFromHandle = async (handle) => {
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/tweets/search/recent?query=from:${handle}&tweet.fields=created_at`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    const tweets = response.data.data;
    return tweets?.map((t) => ({
      tweetId: t.id,
      handle: handle,
      text: t.text,
      url: `https://x.com/${handle}/status/${t.id}`,
      timestamp: t.created_at,
    })) || [];

  } catch (error) {
    console.error(`Failed fetching from @${handle}:`, error.message);
    return [];
  }
};

const fetchTweetsFromAllHandles = async (req, res) => {
  const handles = await Handle.find({ validated: true });
  let newTweets = [];

  for (let handleObj of handles) {
    const tweets = await fetchTweetsFromHandle(handleObj.username);

    for (let tweet of tweets) {
      const existing = await Tweet.findOne({ tweetId: tweet.tweetId });

      if (!existing) {
        // Generate QR Code
        const qrCode = await QRCode.toDataURL(tweet.url);
        tweet.qrCode = qrCode;

        // Save to DB
        const saved = await Tweet.create(tweet);
        newTweets.push(saved);
      }
    }
  }

  res.status(200).json({ newTweets });
};
const getNextTweetToDisplay = async (req, res) => {
  try {
    const tweet = await Tweet.findOne({ isDisplayed: false }).sort({ timestamp: 1 });

    if (!tweet) {
      return res.status(404).json({ message: 'No new tweets to display.' });
    }

    // Mark as displayed
    tweet.isDisplayed = true;
    await tweet.save();

    res.status(200).json(tweet);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching next tweet.' });
  }
};

const validateHandle = async (req, res) => {
  const { username } = req.body;

  try {
    const response = await axios.get(
      `https://api.twitter.com/2/users/by/username/${username}`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    // If valid, save to DB
    let handle = await Handle.findOne({ username });
    if (!handle) {
      handle = new Handle({ username, validated: true });
    } else {
      handle.validated = true;
    }

    await handle.save();

    res.status(200).json({ message: 'Handle validated and saved.', handle });

  } catch (error) {
    res.status(400).json({
      message: 'Invalid Twitter handle or not found.',
      error: error.response?.data || error.message,
    });
  }
};

module.exports = {
  fetchTweetsFromAllHandles,
  getNextTweetToDisplay,
  validateHandle
};
