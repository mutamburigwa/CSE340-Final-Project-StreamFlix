const express = require('express'); // Import Express
const bodyParser = require('body-parser');
const mongodb = require('./data/database');
const routes = require('./routes'); // Import routes from ./routes
require('dotenv').config();

const app = express(); // Initialize Express app
const port = process.env.PORT || 3000; // Use environment PORT or default to 3000

// Middleware for JSON parsing
app.use(bodyParser.json());

// Set CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Z-Key'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  next();
});

// Route handling
app.use('/', routes);

// Import and use movies routes
const moviesRoutes = require("./routes/movies");
app.use("/movies", moviesRoutes);

// Start server after DB initialization
mongodb.initDb((err) => {
  if (err) {
    console.error('Database initialization failed:', err);
  } else {
    app.listen(port, () => {
      console.log(`Database connected. Server running on http://localhost:${port}`);
    });
  }
});
