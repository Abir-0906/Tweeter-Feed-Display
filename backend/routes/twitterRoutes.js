const express = require('express');
const router = express.Router();
const {
  fetchTweetsFromAllHandles,
  getNextTweetToDisplay,
  validateHandle,
  fetchTweetsFromHandle,
} = require('../controllers/twitterController');
const Handle = require('../models/Handle');

router.get('/fetch-all', fetchTweetsFromAllHandles);
router.get('/next-tweet', getNextTweetToDisplay);
router.post('/validate-handle', validateHandle);
router.get('/tweets/:handle', async (req, res) => {
  const { handle } = req.params;

  // ✅ Find the full handle object from DB
  const handleObj = await Handle.findOne({ username: handle });

  if (!handleObj || !handleObj.userId) {
    return res.status(404).json({ message: 'Handle not validated or missing userId.' });
  }

  const tweets = await fetchTweetsFromHandle(handleObj);
  res.json(tweets);
});


module.exports = router;
