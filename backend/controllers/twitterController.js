// backend/controllers/twitterController.js
const axios = require('axios');
const Tweet = require('../models/Tweet');
const handle = require('../models/handle');
const QRCode = require('qrcode');
//const Handle = require('../models/Handle.js');

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

module.exports = {
  fetchTweetsFromAllHandles,
};
