const express = require("express");
const router = express.Router();
const congeController = require("../controllers/conge");
const authMiddleware = require("../middlewares/auth");
const congeValidator = require("../middlewares/request_validator/conge");

router.get("/",authMiddleware.loggedMiddleware,authMiddleware.isAdmin, congeController.getAll);
router.get("/:id",authMiddleware.loggedMiddleware,authMiddleware.isChoriste, congeController.getById);
router.post("/",authMiddleware.loggedMiddleware,authMiddleware.isChoriste,congeValidator.createConge,congeController.create);
router.patch("/:id",authMiddleware.loggedMiddleware,authMiddleware.isChoriste,congeValidator.updateConge, congeController.update);
router.delete("/:id",authMiddleware.loggedMiddleware,authMiddleware.isChoriste,congeController.delete);
router.post("/validerconge/:id",authMiddleware.loggedMiddleware,authMiddleware.isAdmin, congeController.validerConge);


module.exports = router;
