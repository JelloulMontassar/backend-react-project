const express = require("express");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();
const oeuvresController = require("../controllers/oeuvres");

router.post(
  "/ajoutoeuvre",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  oeuvresController.ajout
);
router.get(
  "/getoeuvre",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  oeuvresController.getoeuvre
);
router.get(
  "/getoeuvreID/:id",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  oeuvresController.getoeuvrebyId
);
router.get(
  "/deleteoeuvre/:id",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  oeuvresController.deleteoeuvre
);
router.patch(
  "/updateoeuvre/:id",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  oeuvresController.updateoeuvre
);
router.get(
  "/statistiqueParOeuvre",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  oeuvresController.statistiqueParOeuvre
);

module.exports = router;
