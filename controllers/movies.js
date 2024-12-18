const mongodb = require("../data/database");
const multer = require("multer");
const path = require("path");

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../movies")); // Save files in the 'movies' folder
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName); // Generate unique filenames
  },
});

const upload = multer({ storage });

// Get all movies
const getAllMovies = async (req, res) => {
  try {
    const db = mongodb.getDatabase().db();
    const movies = await db.collection("movies").find().toArray();
    res.status(200).json(movies);
  } catch (error) {
    console.error("Error retrieving movies:", error);
    res.status(500).json({ message: "Error retrieving movies", error: error.message });
  }
};

// Create a new movie
const createMovie = async (req, res) => {
  try {
    upload.single("thumbnail")(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(500).json({ message: "File upload error", error: err.message });
      }

      const { title, description, url, releaseDate, genre, director, cast, language, runtime } = req.body;

      // Validate required fields
      if (!title || !description || !url || !req.file || !releaseDate || !genre || !director || !cast || !language || !runtime) {
        return res.status(400).json({ message: "All fields are required" });
      }

      let parsedCast;
      try {
        parsedCast = JSON.parse(cast); // Expecting a JSON array of actors
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid format for cast. It should be a JSON array." });
      }

      const db = mongodb.getDatabase().db();
      const newMovie = {
        title,
        description,
        url,
        releaseDate,
        genre: genre.split(","),
        director,
        cast: parsedCast,
        language,
        runtime,
        thumbnail: req.file.filename,
        createdAt: new Date(),
      };

      const response = await db.collection("movies").insertOne(newMovie);

      if (response.acknowledged) {
        res.status(201).json({ message: "Movie created successfully", movie: newMovie });
      } else {
        res.status(500).json({ message: "Error adding movie" });
      }
    });
  } catch (error) {
    console.error("Error adding movie:", error);
    res.status(500).json({ message: "Error adding movie", error: error.message });
  }
};

// Get a single movie by ID
const getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    const db = mongodb.getDatabase().db();
    const movie = await db.collection("movies").findOne({ _id: new mongodb.ObjectId(movieId) });

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json(movie);
  } catch (error) {
    console.error("Error retrieving movie:", error);
    res.status(500).json({ message: "Error retrieving movie", error: error.message });
  }
};

// Update a movie by ID
const updateMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    const { title, description, url, releaseDate, genre, director, cast, language, runtime } = req.body;

    const db = mongodb.getDatabase().db();

    const updatedMovie = {
      ...(title && { title }),
      ...(description && { description }),
      ...(url && { url }),
      ...(releaseDate && { releaseDate }),
      ...(genre && { genre: genre.split(",") }),
      ...(director && { director }),
      ...(cast && { cast: JSON.parse(cast) }),
      ...(language && { language }),
      ...(runtime && { runtime }),
      updatedAt: new Date(),
    };

    const response = await db.collection("movies").updateOne({ _id: new mongodb.ObjectId(movieId) }, { $set: updatedMovie });

    if (response.matchedCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie updated successfully" });
  } catch (error) {
    console.error("Error updating movie:", error);
    res.status(500).json({ message: "Error updating movie", error: error.message });
  }
};

// Delete a movie by ID
const deleteMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    const db = mongodb.getDatabase().db();

    const response = await db.collection("movies").deleteOne({ _id: new mongodb.ObjectId(movieId) });

    if (response.deletedCount === 0) {
      return res.status(404).json({ message: "Movie not found" });
    }

    res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error("Error deleting movie:", error);
    res.status(500).json({ message: "Error deleting movie", error: error.message });
  }
};

module.exports = {
  getAllMovies,
  createMovie,
  getMovieById,
  updateMovieById,
  deleteMovieById,
};
