// backend/routes/twitterRoutes.js
const express = require('express');
const router = express.Router();
const { fetchTweetsFromAllHandles, getNextTweetToDisplay ,validateHandle} = require('../controllers/twitterController');

router.get('/fetch-tweets', fetchTweetsFromAllHandles);

router.get('/next-tweet', getNextTweetToDisplay);

router.post('/validate-handle', validateHandle);


module.exports = router;
