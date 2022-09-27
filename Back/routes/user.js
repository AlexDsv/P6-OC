const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");


//Routes utilisateurs pour s'inscrire et se connecter
router.post("/signup", userController.signup);
router.post("/login", userController.login);

module.exports = router;    