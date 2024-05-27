const express = require("express");
const router = express.Router();
const pupitreController = require("../controllers/pupitre");
const requestValidator = require("../middlewares/request_validator/pupitre");
const authMiddleware = require("../middlewares/auth");

router.patch(
  "/needs/:name",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  requestValidator.defineNeeds,
  pupitreController.defineNeeds
);
router.patch(
  "/changeTissiture",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  pupitreController.changeTissiture
);
router.patch(
  "/designerChefs",
  authMiddleware.loggedMiddleware,
  authMiddleware.isManager,
  pupitreController.designer2Chefs
);
router.get(
  "/getListeParPupitre",
  authMiddleware.loggedMiddleware,
  pupitreController.getListeChoristesPresProgRep
);
router.get(
  "/getusersseuilpres/:id",
  authMiddleware.loggedMiddleware,
  pupitreController.getChoristesseuilpres
);
router.get("/", pupitreController.getAll);

module.exports = router;
