const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth");
const authMiddleware = require("../middlewares/auth");
const requestValidator = require("../middlewares/request_validator/auth");

router.post("/login", requestValidator.login, AuthController.loginUser);
router.post("/adduser",authMiddleware.loggedMiddleware,authMiddleware.isAdmin, AuthController.registerUser);

module.exports = router;
