const express = require("express");
const { authenticateToken } = require("../middleware/auth");
const router = express.Router();

const usersController = require("../controllers/users");

router.get("/", authenticateToken, usersController.getAll);
router.get("/:id", authenticateToken, usersController.getSingle);
router.post("/", usersController.createUser);
router.post("/login", usersController.login);
router.put("/:id", authenticateToken, usersController.updateUser);
router.delete("/:id", authenticateToken, usersController.deleteUser);

module.exports = router;
