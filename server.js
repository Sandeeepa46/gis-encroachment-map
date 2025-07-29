const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON bodies
app.use(express.static('public')); // Serve static files from the 'public' folder

// DB Config
// DB Config
const db = 'mongodb://127.0.0.1:27017/gis-db';
// Connect to MongoDB
mongoose
    .connect(db)
    .then(() => console.log('MongoDB Connected...'))
    .catch(err => console.log(err));

// Use Routes
app.use('/api', require('./routes/api'));

// Define the port and start the server
const port = 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));