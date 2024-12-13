const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
  
    if (!token) {
      return res.status(401).json({ message: "Access token required" });
    }
  
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid or expired token" });
      }
  
      req.user = user;
      next();
    });
  };
  
  const authorizeRole = (requiredRole) => {
    return (req, res, next) => {
      const { role } = req.user; // Assumes req.user is populated by authenticateToken middleware
  
      if (!role || role !== requiredRole) {
        return res
          .status(403)
          .json({ message: "Access denied. Insufficient permissions." });
      }
  
      next();
    };
  };
  



const getAllMovies = async (req, res) => {


    try {
      const db = mongodb.getDatabase().db();
      const movies = await db.collection("movies").find().toArray();
  
      res.status(200).json(movies);
    } catch (error) {
      res.status(500).json({ message: "Error retrieving movies", error: error.message });
    }
  };
  
  const createMovie = async (req, res) => {
    try {
      const { title, description, url } = req.body;
  
      if (!title || !description || !url) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const db = mongodb.getDatabase().db();
      const newMovie = { title, description, url, createdAt: new Date() };
  
      const response = await db.collection("movies").insertOne(newMovie);
  
      if (response.acknowledged) {
        res.status(201).json({ message: "Movie created successfully" });
      } else {
        res.status(500).json({ message: "Error adding movie" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error adding movie", error: error.message });
    }
  };
  
  module.exports = {
    authenticateToken,
    authorizeRole,
    getAllMovies,
    createMovie,
  };
  