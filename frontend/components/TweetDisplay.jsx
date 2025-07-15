import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import './TweetDisplay.css';

const HANDLES = ['elonmusk', 'BillGates', 'NASA', 'Snowden'];
const TWEET_ROTATION_INTERVAL = 15000; // 15 seconds
const DATA_REFRESH_INTERVAL = 3600000; // 1 hour

const TweetDisplay = () => {
  const [tweets, setTweets] = useState([]);
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [currentHandle, setCurrentHandle] = useState(HANDLES[0]);
  const [isSecondaryScreen, setIsSecondaryScreen] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const rotationIntervalRef = useRef();
  const refreshIntervalRef = useRef();

  // Detect secondary monitor
  const checkScreen = () => {
    const windowLeft = window.screenLeft || window.screenX;
    const primaryScreenWidth = window.screen.width;
    setIsSecondaryScreen(windowLeft >= primaryScreenWidth);
  };

  // Enhanced tweet fetching with error handling
  const fetchTweets = async () => {
    try {
      setError('');
      const { data } = await axios.get(
        `http://localhost:5000/api/twitter/tweets/${currentHandle.toLowerCase()}`,
        { params: { _: Date.now() } } // Cache busting
      );

      if (data?.length > 0) {
        setTweets(data);
        setCurrentTweetIndex(0);
        setLastUpdated(new Date());
      } else {
        setError(`No tweets found for @${currentHandle}`);
        setTweets([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.response?.data?.message || 'Failed to fetch tweets');
      setTweets([]);
    }
  };

  // Enhanced text formatting
  const formatTweetText = (text) => {
    if (!text) return '';
    
    return text
      .replace(/https?:\/\/\S+/g, '') // Remove URLs
      .replace(/\n/g, '<br />') // Preserve line breaks
      .replace(/@(\w+)/g, '<span class="mention">@$1</span>') // Style mentions
      .replace(/#(\w+)/g, '<span class="hashtag">#$1</span>') // Style hashtags
      .replace(/(^|\s)([A-Za-z]+:\/\/[^\s]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>'); // Re-add links as clickable
  };

  // Start tweet rotation
  const startRotation = () => {
    clearInterval(rotationIntervalRef.current);
    if (tweets.length > 1) {
      rotationIntervalRef.current = setInterval(() => {
        setCurrentTweetIndex(prev => (prev + 1) % tweets.length);
      }, TWEET_ROTATION_INTERVAL);
    }
  };

  // Setup hourly refresh
  const setupDataRefresh = () => {
    clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(() => {
      fetchTweets();
    }, DATA_REFRESH_INTERVAL);
  };

  useEffect(() => {
    checkScreen();
    window.addEventListener('resize', checkScreen);
    fetchTweets();
    setupDataRefresh();

    return () => {
      clearInterval(rotationIntervalRef.current);
      clearInterval(refreshIntervalRef.current);
      window.removeEventListener('resize', checkScreen);
    };
  }, [currentHandle]);

  useEffect(() => {
    startRotation();
  }, [tweets]);

  if (error) return (
    <div className="error-screen">
      <div className="error-message">{error}</div>
      <button onClick={fetchTweets} className="retry-button">
        Retry
      </button>
    </div>
  );

  if (tweets.length === 0) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading tweets for @{currentHandle}...</p>
    </div>
  );

  const currentTweet = tweets[currentTweetIndex];

  return (
    <div className={`container ${isSecondaryScreen ? 'secondary-screen' : ''}`}>
      <div className="header-bar">
        <select
          className="handle-selector"
          value={currentHandle}
          onChange={(e) => setCurrentHandle(e.target.value)}
        >
          {HANDLES.map((handle) => (
            <option key={handle} value={handle}>@{handle}</option>
          ))}
        </select>
        
        {lastUpdated && (
          <div className="last-updated">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentTweet.tweetId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="tweet-card"
        >
          <div className="tweet-header">
            <h2 className="handle">@{currentTweet.handle}</h2>
            <p className="timestamp">
              {new Date(currentTweet.timestamp).toLocaleString()}
            </p>
          </div>

          <div 
            className="tweet-content"
            dangerouslySetInnerHTML={{ __html: formatTweetText(currentTweet.text) }}
          />

          {currentTweet.mediaUrl && (
            <div className="media-container">
              <img 
                src={currentTweet.mediaUrl} 
                alt="Tweet media" 
                className="tweet-media"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          )}

          <div className="qr-footer">
            <QRCode 
              value={currentTweet.url} 
              size={128}
              bgColor="transparent"
              fgColor="#1DA1F2"
              className="qr-code"
            />
            <a 
              href={currentTweet.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tweet-link"
            >
              View on Twitter
            </a>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default TweetDisplay;