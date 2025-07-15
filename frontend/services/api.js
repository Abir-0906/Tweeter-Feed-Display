
import axios from 'axios';

const API = axios.create({
   baseURL: 'http://localhost:5000/api/twitter',
});

export const fetchNextTweet = () => API.get('/next-tweet');
