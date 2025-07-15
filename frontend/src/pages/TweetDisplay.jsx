import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import TweetCard from '../components/TweetCard';
import { fetchTweetsByHandle } from '../services/twitterApi';
import '../styles/TweetDisplay.css';

const HANDLES = ['elonmusk', 'BillGates', 'NASA', 'Snowden'];
const TWEET_DISPLAY_DURATION = 90000;
const DATA_REFRESH_INTERVAL = 3600000;

const TweetDisplay = () => {
  const [tweets, setTweets] = useState([]);
  const [currentTweetIndex, setCurrentTweetIndex] = useState(0);
  const [currentHandle, setCurrentHandle] = useState(HANDLES[0]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const rotationIntervalRef = useRef();
  const refreshIntervalRef = useRef();

  const fetchTweets = async () => {
    try {
      setError('');
      const data = await fetchTweetsByHandle(currentHandle);
      if (data?.length > 0) {
        setTweets(data);
        setCurrentTweetIndex(0);
        setLastUpdated(new Date());
      } else {
        setError(`No tweets found for @${currentHandle}`);
        setTweets([]);
      }
    } catch (err) {
      setError('Failed to fetch tweets');
      setTweets([]);
    }
  };

  const startRotation = () => {
    clearInterval(rotationIntervalRef.current);
    if (tweets.length > 1) {
      rotationIntervalRef.current = setInterval(() => {
        setCurrentTweetIndex(prev => (prev + 1) % tweets.length);
      }, TWEET_DISPLAY_DURATION);
    }
  };

  const goToNextTweet = () => {
    setCurrentTweetIndex(prev => (prev + 1) % tweets.length);
    resetRotationTimer();
  };

  const resetRotationTimer = () => {
    clearInterval(rotationIntervalRef.current);
    startRotation();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  const setupDataRefresh = () => {
    clearInterval(refreshIntervalRef.current);
    refreshIntervalRef.current = setInterval(fetchTweets, DATA_REFRESH_INTERVAL);
  };

  useEffect(() => {
    fetchTweets();
    setupDataRefresh();
    return () => {
      clearInterval(rotationIntervalRef.current);
      clearInterval(refreshIntervalRef.current);
    };
  }, [currentHandle]);

  useEffect(() => {
    startRotation();
    return () => clearInterval(rotationIntervalRef.current);
  }, [tweets]);

  if (error) return (
    <div className="error-screen">
      <div className="error-message">{error}</div>
      <button onClick={fetchTweets} className="retry-button">Retry</button>
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
    <div className="container">
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
        <div className="header-info">
          {lastUpdated && (
            <div className="last-updated">Updated: {lastUpdated.toLocaleTimeString()}</div>
          )}
          <button onClick={toggleFullscreen} className="fullscreen-button">
            {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          </button>
        </div>
      </div>

      <div className="tweet-container">
        <AnimatePresence mode="wait">
          <TweetCard tweet={currentTweet} />
        </AnimatePresence>
        <button className="nav-button right" onClick={goToNextTweet}>→</button>
      </div>
    </div>
  );
};

export default TweetDisplay;
