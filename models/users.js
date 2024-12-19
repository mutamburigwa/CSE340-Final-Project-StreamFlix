const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Store hashed passwords
  role: { type: String, enum: ["user", "admin"], default: "user" }, // Role-based access
  myList: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }], // Reference to Movie model
});

module.exports = mongoose.model("User", UserSchema);
