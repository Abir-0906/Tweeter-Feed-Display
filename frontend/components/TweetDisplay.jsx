import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QRCode from 'react-qr-code'; 

const TweetDisplay = () => {
  const [tweet, setTweet] = useState(null);
  const [error, setError] = useState('');

  const fetchTweet = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/twitter/next-tweet');
      console.log("✅ Data fetched:", res.data);
      setTweet(res.data);
      setError('');
    } catch (err) {
      setTweet(null);
      setError(err.response?.data?.message || 'Error fetching tweet.');
    }
  };

  useEffect(() => {
    fetchTweet();
    const interval = setInterval(fetchTweet, 60 * 10000); // 10 minutes for now
    return () => clearInterval(interval);
  }, []);

  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!tweet) return <div className="text-center">Loading tweet...</div>;

  // Construct tweet URL (assuming tweetId is from X platform)
  const tweetUrl = `https://x.com/${tweet.username}/status/${tweet.tweetId}`;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gray-100 rounded-xl shadow-lg max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-semibold mb-4">@{tweet.username}</h2>
      <p className="text-lg mb-4">{tweet.text}</p>

      {/* ✅ QR Code section */}
      <div className="mt-6 bg-white p-4 rounded">
        <QRCode value={tweetUrl} size={128} />
        <p className="mt-2 text-sm text-gray-600 break-words text-center">{tweetUrl}</p>
      </div>
    </div>
  );
};

export default TweetDisplay;
