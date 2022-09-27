const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");
const sauceController = require("../controllers/sauces");

//Routes pour toutes les différentes reqûetes possibles
router.post("/", auth, multer, sauceController.createSauce);
router.get("/", auth, sauceController.getAllSauces);
router.get("/:id", auth, sauceController.getOneSauce);
router.put("/:id", auth, multer, sauceController.modifySauce);
router.delete("/:id", auth, sauceController.deleteSauce);
router.post("/:id/like", auth, sauceController.rateSauce)

module.exports = router;