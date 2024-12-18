const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10; // Default to 10 if not defined

const login = async (req, res) => {
  //#swagger.tags=['Authentication']
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const db = mongodb.getDatabase().db();
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ accessToken: token, expiresIn: "1h", username: user.username, role: user.role });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during login", error: error.message });
  }
};


const getAll = async (req, res) => {
  //#swagger.tags=['Users']
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }

  try {
    const db = mongodb.getDatabase().db();
    const users = await db.collection("users").find().toArray();
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving users", error: error.message });
  }
};


const getSingle = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const userId = new ObjectId(req.params.id);
    const db = mongodb.getDatabase().db();
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.setHeader("Content-Type", "application/json");
    res.status(200).json(user);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving user", error: error.message });
  }
};

const createUser = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const { firstName, lastName, email, username, password, role } = req.body;

    if (!firstName || !lastName || !email || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = mongodb.getDatabase().db();
    const existingUser = await db.collection("users").findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS, 10));

    const newUser = {
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
      role: role || "user", // Default to "user" if no role provided
    };

    const response = await db.collection("users").insertOne(newUser);

    if (response.acknowledged) {
      res.status(201).json({ message: "User registered successfully", user: { username, role: newUser.role } });
    } else {
      res
        .status(500)
        .json(response.error || "An error occurred during registration.");
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

  
const updateUser = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const userId = new ObjectId(req.params.id);

    const { firstName, lastName, email, username } = req.body;

    if (!firstName || !lastName || !email || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const db = mongodb.getDatabase().db();
    const user = await db.collection("users").findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = {
      firstName,
      lastName,
      email,
      username,
    };

    const response = await db.collection("users").updateOne({ _id: userId }, { $set: updatedUser });

    if (response.modifiedCount > 0) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Error updating user." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating user", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  //#swagger.tags=['Users']
  try {
    const userId = new ObjectId(req.params.id);
    const db = mongodb.getDatabase().db();

    const user = await db.collection("users").findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const response = await db.collection("users").deleteOne({ _id: userId });

    if (response.deletedCount > 0) {
      res.status(204).send();
    } else {
      res.status(500).json({ message: "Error deleting user." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting user", error: error.message });
  }
};


module.exports = {
  login,
  getAll,
  getSingle,
  createUser,
  updateUser,
  deleteUser,
};
