import React from 'react';
import { motion } from 'framer-motion';
import QRFooter from './QRFooter';
import TweetHeader from './TweetHeader';
import { formatTweetText } from '../utils/formatTweetText';

const TweetCard = ({ tweet }) => {
  if (!tweet) return null;

  return (
    <motion.div
      key={tweet.tweetId}
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
      className="tweet-card"
    >
      <TweetHeader handle={tweet.handle} timestamp={tweet.timestamp} />
      <div
        className="tweet-content"
        dangerouslySetInnerHTML={{ __html: formatTweetText(tweet.text) }}
      />
      {tweet.mediaUrl && (
        <div className="media-container">
          <img
            src={tweet.mediaUrl}
            alt="Tweet media"
            className="tweet-media"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
      )}
      <QRFooter url={tweet.url} />
    </motion.div>
  );
};

export default TweetCard;
