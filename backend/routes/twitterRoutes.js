// backend/routes/twitterRoutes.js
const express = require('express');
const router = express.Router();
const { fetchTweetsFromAllHandles } = require('../controllers/twitterController');

router.get('/fetch-tweets', fetchTweetsFromAllHandles);

module.exports = router;
