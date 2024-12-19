const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const movieController = require("../controllers/movies");

const router = express.Router();

// Movie Recommendations
router.get("/recommendations", authenticateToken, movieController.getRecommendations);

// My List
router.post("/my-list", authenticateToken, movieController.addToMyList);
router.get("/my-list", authenticateToken, movieController.getMyList);

// Routes for Movies
router.get("/", authenticateToken, movieController.getAllMovies); // Get all movies
router.get("/:id", authenticateToken, movieController.getMovieById); // Get a movie by ID
router.post("/", authenticateToken, authorizeRole("admin"), movieController.createMovie); // Admin: Create a movie
router.put("/:id", authenticateToken, authorizeRole("admin"), movieController.updateMovieById); // Admin: Update a movie
router.delete("/:id", authenticateToken, authorizeRole("admin"), movieController.deleteMovieById); // Admin: Delete a movie

module.exports = router;
