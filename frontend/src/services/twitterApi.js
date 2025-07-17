import axios from 'axios';

const API = "http://localhost:5000";

export const fetchTweetsByHandle = async (handle) => {
  try {
    const { data } = await axios.get(
      `${API}/api/twitter/tweets/${handle.toLowerCase()}`,
      {
        params: { _: Date.now() }, // Cache busting
        timeout: 10000,
        withCredentials: true, // if you use cookies for auth
      }
    );
    return data;
  } catch (err) {
    throw err?.response?.data?.message || 'Failed to fetch tweets';
  }
};
