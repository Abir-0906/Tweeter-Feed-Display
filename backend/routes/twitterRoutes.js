const express = require('express');
const router = express.Router();
const {
  fetchTweetsFromAllHandles,
  getNextTweetToDisplay,
  validateHandle,
  fetchTweetsFromHandle,
} = require('../controllers/twitterController');

router.get('/fetch-all', fetchTweetsFromAllHandles);
router.get('/next-tweet', getNextTweetToDisplay);
router.post('/validate-handle', validateHandle);
router.get('/tweets/:handle', async (req, res) => {
  const { handle } = req.params;
  const tweets = await fetchTweetsFromHandle(handle);
  res.json(tweets);
});

module.exports = router;
