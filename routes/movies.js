const express = require("express");
const { authenticateToken, authorizeRole } = require("../middleware/auth");
const movieController = require("../controllers/movies");

const router = express.Router();

// Routes for Movies
router.get("/", authenticateToken, movieController.getAllMovies); // All authenticated users can view movies
router.get("/:id", authenticateToken, movieController.getMovieById); // All authenticated users can view a single movie
router.post("/", authenticateToken, authorizeRole("admin"), movieController.createMovie); // Only admins can create movies
router.put("/:id", authenticateToken, authorizeRole("admin"), movieController.updateMovieById); // Only admins can update movies
router.delete("/:id", authenticateToken, authorizeRole("admin"), movieController.deleteMovieById); // Only admins can delete movies

module.exports = router;
