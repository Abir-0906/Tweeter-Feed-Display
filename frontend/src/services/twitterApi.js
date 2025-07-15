import axios from 'axios';

export const fetchTweetsByHandle = async (handle) => {
  try {
    const { data } = await axios.get(
      `http://localhost:5000/api/twitter/tweets/${handle.toLowerCase()}`,
      {
        params: { _: Date.now() }, // Cache busting
        timeout: 10000,
      }
    );
    return data;
  } catch (err) {
    throw err.response?.data?.message || 'Failed to fetch tweets';
  }
};
