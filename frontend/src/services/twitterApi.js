import axios from 'axios';

const API = import.meta.env.VITE_API_URL;

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
