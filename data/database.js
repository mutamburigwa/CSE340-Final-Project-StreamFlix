const mongoose = require("mongoose");
require("dotenv").config();

let isConnected = false; // Track connection status

// Initialize the database
const initDb = async (callback) => {
  if (isConnected) {
    console.log("Database is already connected!");
    return callback(null); // Return without error
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("Connected to MongoDB!");
    callback(null); // Call callback without error
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    callback(error); // Pass the error to the callback
  }
};

// Check database connection status
const checkConnection = () => {
  if (!isConnected) {
    throw new Error("Database not connected!");
  }
  return true; // Connection is valid
};

module.exports = {
  initDb,
  checkConnection,
};
