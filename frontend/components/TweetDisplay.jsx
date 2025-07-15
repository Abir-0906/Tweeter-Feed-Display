import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import './TweetDisplay.css'; // Create this file (CSS included below)

// Predefined Twitter handles to fetch
const HANDLES = ['elonmusk', 'BillGates', 'NASA', 'Snowden'];

const TweetDisplay = () => {
  const [tweets, setTweets] = useState([]);
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [currentHandle, setCurrentHandle] = useState(HANDLES[1]);
  const [isSecondaryScreen, setIsSecondaryScreen] = useState(false);
  const [error, setError] = useState('');
  const intervalRef = useRef();

  // 1. Detect secondary monitor
  const checkScreen = () => {
    const windowLeft = window.screenLeft || window.screenX;
    const primaryScreenWidth = window.screen.width;
    setIsSecondaryScreen(windowLeft >= primaryScreenWidth);
  };

  // 2. Fetch tweets from backend API
  const fetchTweets = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/twitter/tweets/${currentHandle}`
      );
      if (res.data.length > 0) {
        setTweets(res.data);
        setError('');
      } else {
        setError(`No tweets found for @${currentHandle}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tweets');
    }
  };

  // 3. Auto-rotate tweets with smooth transitions
  const startRotation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentTweetIndex((prev) => (prev + 1) % tweets.length);
    }, 1500000); // Rotate every 15 seconds
  };

  useEffect(() => {
    checkScreen();
    window.addEventListener('resize', checkScreen);

    fetchTweets();
    startRotation();

    return () => {
      clearInterval(intervalRef.current);
      window.removeEventListener('resize', checkScreen);
    };
  }, [currentHandle]);

  // 4. Format tweet text (links, hashtags)
  const formatTweetText = (text) => {
    return text
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/\n/g, '<br />') // Preserve line breaks
      .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>'); // Style hashtags
  };

  if (error) return <div className="error">{error}</div>;
  if (tweets.length === 0) return <div className="loading">Loading...</div>;

  const currentTweet = tweets[currentTweetIndex];

  return (
    <div className={`container ${isSecondaryScreen ? 'secondary-screen' : ''}`}>
      {/* Handle selector dropdown */}
      <select
        className="handle-selector"
        value={currentHandle}
        onChange={(e) => setCurrentHandle(e.target.value)}
      >
        {HANDLES.map((handle) => (
          <option key={handle} value={handle}>@{handle}</option>
        ))}
      </select>

      {/* Animated tweet display */}
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentTweet.tweetId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="tweet-card"
        >
          <div className="tweet-header">
            <h2>@{currentTweet.handle}</h2>
            <p>{new Date(currentTweet.timestamp).toLocaleString()}</p>
          </div>

          <div 
            className="tweet-text"
            dangerouslySetInnerHTML={{ __html: formatTweetText(currentTweet.text) }}
          />

          {currentTweet.mediaUrl && (
            <img 
              src={currentTweet.mediaUrl} 
              alt="Tweet media" 
              className="tweet-media"
            />
          )}

          <div className="qr-container">
            <QRCode 
              value={currentTweet.url} 
              size={128}
              bgColor="transparent"
              fgColor="#1DA1F2" // Twitter blue
            />
            <p className="tweet-url">{currentTweet.url}</p>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
export default TweetDisplay;