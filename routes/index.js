
const express = require('express');
const router = express.Router();

// Import other route modules
const swaggerRoutes = require('./swagger');
const userRoutes = require('./users');

// Add Swagger documentation routes
router.use('/', swaggerRoutes); // Serve API docs under /api-docs

// Root route
router.get('/', (req, res) => { 
    //#swagger.tags=['Root']
    res.send('Welcome to the streamflix-API');
});

// Add user-related routes under /users
router.use('/users', userRoutes);

module.exports = router;
