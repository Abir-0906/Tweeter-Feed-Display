require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();
const cors = require('cors');
const tweetRoutes = require('./routes/twitterRoutes');
// Init
connectDB();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());




// Test route
app.get('/', (req, res) => res.send('API Running'));






// Routes
app.use('/api/twitter', tweetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));