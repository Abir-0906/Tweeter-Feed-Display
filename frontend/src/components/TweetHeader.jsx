import React from 'react';

const TweetHeader = ({ handle, timestamp }) => (
  <div className="tweet-header">
    <h2 className="handle">@{handle}</h2>
    <p className="timestamp">
      {new Date(timestamp).toLocaleString()}
    </p>
  </div>
);

export default TweetHeader;
