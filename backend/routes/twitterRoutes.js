// backend/routes/twitterRoutes.js
const express = require('express');
const router = express.Router();
const { fetchTweetsFromAllHandles, getNextTweetToDisplay } = require('../controllers/twitterController');

router.get('/fetch-tweets', fetchTweetsFromAllHandles);

router.get('/next-tweet', getNextTweetToDisplay);

module.exports = router;
