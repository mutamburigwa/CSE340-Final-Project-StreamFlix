const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema({
  title: String,
  description: String,
  url: String,
  releaseDate: Date,
  genre: [String],
  director: String,
  cast: [String],
  language: String,
  runtime: Number,
  thumbnail: String,
});

module.exports = mongoose.model("Movie", MovieSchema);
