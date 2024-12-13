const mongodb = require("../data/database");
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require('dotenv').config();
const SALT_ROUNDS = process.env.SALT_ROUNDS || 10; // Default to 10 if not defined

const getAll = async (req, res) => {
  //#swagger.tags=['Users']
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
      const { firstName, lastName, email, username, password } = req.body;
  
      if (!firstName || !lastName || !email || !username || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      const db = mongodb.getDatabase().db();
      const existingUser = await db.collection("users").findOne({ username });
  
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
  
      const hashedPassword = await bcrypt.hash(password, parseInt(SALT_ROUNDS, 10));
  
      const newUser = {
        firstName,
        lastName,
        email,
        username,
        password: hashedPassword,
        role: "user",
      };
  
      const response = await db.collection("users").insertOne(newUser);
  
      if (response.acknowledged) {
        res.status(201).json({ message: "User registered successfully" });
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
  const userId = new ObjectId(req.params.id);
  const user = {
    firstName,
    lastName,
    email,
    username,
  };

  const response = await mongodb
    .getDatabase()
    .db()
    .collection("users")
    .replaceOne({ _id: userId }, user);

  if (response.modifiedCount > 0) {
    res.status(204).send();
  } else {
    res
      .status(500)
      .json(response.error || "Some error occurred while updating the user.");
  }
};

const deleteUser = async (req, res) => {
  //#swagger.tags=['Users']
  const userId = new ObjectId(req.params.id);
  const response = await mongodb
    .getDatabase()
    .db()
    .collection("users")
    .deleteOne({ _id: userId });
  if (response.deleteCount > 0) {
    res.status(204).send();
  } else {
    res
      .status(500)
      .json(response.error || "Some error occurred while deleting the user.");
  }
};

module.exports = {
  getAll,
  getSingle,
  createUser,
  updateUser,
  deleteUser,
};
