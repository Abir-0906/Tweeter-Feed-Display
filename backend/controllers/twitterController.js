const axios = require('axios');
const Tweet = require('../models/Tweet');
const Handle = require('../models/Handle');
const QRCode = require('qrcode');

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Step 1: Get Twitter user ID by username
const getUserIdFromHandle = async (handle) => {
  const response = await axios.get(
    `https://api.twitter.com/2/users/by/username/${handle}`,
    {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`,
      },
    }
  );
  return response.data.data.id;
};

// Step 2: Fetch tweets from user ID
const fetchTweetsFromHandle = async (handle) => {
  try {
    await new Promise((r) => setTimeout(r, 2000)); // Delay to respect rate limit

    const userId = await getUserIdFromHandle(handle);

    const response = await axios.get(
      `https://api.twitter.com/2/users/${userId}/tweets?tweet.fields=created_at,attachments&expansions=attachments.media_keys&media.fields=url`,
      {
        headers: {
          Authorization: `Bearer ${BEARER_TOKEN}`,
        },
      }
    );

    const tweets = response.data.data || [];
    const media = response.data.includes?.media || [];

    return tweets.map((tweet) => {
      const tweetMedia = media.find(
        (m) => m.media_key === tweet.attachments?.media_keys?.[0]
      );

      return {
        tweetId: tweet.id,
        handle: handle,
        text: tweet.text,
        url: `https://x.com/${handle}/status/${tweet.id}`,
        timestamp: tweet.created_at,
        mediaUrl: tweetMedia?.url || null,
      };
    });
  } catch (error) {
    console.error(`Error fetching @${handle}:`, error.response?.data || error.message);
    return [];
  }
};

// Fetch tweets from all handles
const fetchTweetsFromAllHandles = async (req, res) => {
  const handles = await Handle.find({ validated: true });
  let newTweets = [];

  for (let handleObj of handles) {
    const tweets = await fetchTweetsFromHandle(handleObj.username);

    for (let tweet of tweets) {
      const exists = await Tweet.findOne({ tweetId: tweet.tweetId });

      if (!exists) {
        const qrCode = await QRCode.toDataURL(tweet.url);
        tweet.qrCode = qrCode;

        const saved = await Tweet.create(tweet);
        newTweets.push(saved);
      }
    }
  }

  res.status(200).json({ newTweets });
};

// Get next tweet to display
const getNextTweetToDisplay = async (req, res) => {
  try {
    const tweet = await Tweet.findOne({ isDisplayed: false }).sort({ timestamp: 1 });

    if (!tweet) {
      return res.status(404).json({ message: 'No new tweets to display.' });
    }

    tweet.isDisplayed = true;
    await tweet.save();

    res.status(200).json(tweet);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error while fetching next tweet.' });
  }
};

// Validate handle and save it
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
  fetchTweetsFromHandle,
  fetchTweetsFromAllHandles,
  getNextTweetToDisplay,
  validateHandle,
}