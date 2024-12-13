const express = require("express");
const multer = require("multer");
const path = require("path");
const mongodb = require("../data/database");

const router = express.Router();

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
router.get("/", async (req, res) => {
  try {
    const db = mongodb.getDatabase().db();
    const movies = await db.collection("movies").find().toArray();

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Error retrieving movies", error: error.message });
  }
});

// Create a new movie
router.post("/", upload.single("thumbnail"), async (req, res) => {
  try {
    const { title, description, url } = req.body;

    if (!title || !description || !url || !req.file) {
      return res.status(400).json({ message: "All fields (title, description, URL, and thumbnail) are required" });
    }

    const db = mongodb.getDatabase().db();
    const newMovie = {
      title,
      description,
      url,
      thumbnail: req.file.filename, // Store the filename of the uploaded thumbnail
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
});

module.exports = router;
