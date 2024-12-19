const mongodb = require("../data/database");
const path = require("path");
const Movie = require("../models/movies");
const User = require("../models/users"); // Adjust the path based on your folder structure
const mongoose = require("mongoose");

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const db = mongodb.getDatabase().db();
    const movies = await db.collection("movies").find().toArray();
    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving movies", error: error.message });
  }
};

// Get a single movie by ID
const getMovieById = async (req, res) => {
  try {
    const db = mongodb.getDatabase().db();
    const movie = await db.collection("movies").findOne({ _id: new mongodb.ObjectId(req.params.id) });

    if (!movie) return res.status(404).json({ message: "Movie not found" });

    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving movie", error: error.message });
  }
};

// Create a new movie
const createMovie = async (req, res) => {
  try {
    const { title, description, url, releaseDate, genre, director, cast, language, runtime } = req.body;
    const db = mongodb.getDatabase().db();

    // Basic validation
    if (!title || !description || !url || !releaseDate || !genre || !director || !cast || !language || !runtime) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newMovie = {
      title,
      description,
      url,
      releaseDate,
      genre: genre.split(","),
      director,
      cast: JSON.parse(cast),
      language,
      runtime,
      createdAt: new Date(),
    };

    const response = await db.collection("movies").insertOne(newMovie);
    if (response.acknowledged) {
      res.status(201).json({ message: "Movie created successfully", movie: newMovie });
    } else {
      res.status(500).json({ message: "Error adding movie" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error adding movie", error: error.message });
  }
};

// Update a movie by ID
const updateMovieById = async (req, res) => {
  try {
    const db = mongodb.getDatabase().db();
    const updates = { ...req.body, updatedAt: new Date() };

    const response = await db.collection("movies").updateOne(
      { _id: new mongodb.ObjectId(req.params.id) },
      { $set: updates }
    );

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating movie", error: error.message });
  }
};

// Delete a movie by ID
const deleteMovieById = async (req, res) => {
  try {
    const db = mongodb.getDatabase().db();
    const response = await db.collection("movies").deleteOne({ _id: new mongodb.ObjectId(req.params.id) });

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting movie", error: error.message });
  }
};

// Get Recommendations
const getRecommendations = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(500).json({ message: "Database not connected" });
    }

    const movies = await Movie.find();

    if (!movies || movies.length === 0) {
      return res.status(404).json({ message: "No movies available for recommendations." });
    }

    const shuffledMovies = movies.sort(() => 0.5 - Math.random());
    const recommendations = shuffledMovies.slice(0, 10);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("Error fetching random recommendations:", error);
    res.status(500).json({ message: "Error fetching recommendations.", error });
  }
};



// Add to My List
const addToMyList = async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    const userId = req.user.id;
    const { movieId } = req.body;

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required." });
    }

    console.log("Looking for movie:", movieId);
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found." });
    }

    console.log("Movie found:", movie);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User found:", user);
    if (user.myList.includes(movieId)) {
      return res
        .status(400)
        .json({ message: "Movie is already in your list." });
    }

    user.myList.push(movieId);
    await user.save();

    console.log("Movie added to user's list successfully");
    res.status(201).json({ message: "Movie added to your list successfully." });
  } catch (error) {
    console.error("Error adding movie to list:", error);
    res.status(500).json({ message: "Error adding movie to list.", error });
  }
};


// Get My List
const getMyList = async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from JWT payload

    console.log("Fetching user with ID:", userId);

    // Find the user and populate the "myList" field with movie details
    const user = await User.findById(userId).populate("myList");

    if (!user) {
      console.error("User not found.");
      return res.status(404).json({ message: "User not found." });
    }

    console.log("User found:", user);

    res.status(200).json(user.myList); // Return the populated list
  } catch (error) {
    console.error("Error fetching user's list:", error);
    res.status(500).json({ message: "Error fetching your list.", error });
  }
};


module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovieById,
  deleteMovieById,
  getRecommendations,
  addToMyList,
  getMyList,
};