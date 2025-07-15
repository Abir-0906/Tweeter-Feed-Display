require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const tweetRoutes = require('./routes/twitterRoutes');

const app = express();

// Connect MongoDB
connectDB();

// CORS setup
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://neon-rugelach-685a13.netlify.app'
  ],
  credentials: true,
}));

// Middleware
app.use(express.json());

// Test Route
app.get('/', (req, res) => res.send('API Running'));

// API Routes
app.use('/api/twitter', tweetRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
