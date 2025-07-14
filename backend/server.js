require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const app = express();

// Init
connectDB();
app.use(express.json());

// Test route
app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));