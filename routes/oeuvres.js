const express = require("express");
const authMiddleware = require("../middlewares/auth");
const router = express.Router();
const oeuvresController = require("../controllers/oeuvres");

router.get(
  "/statistiqueParOeuvre",
   authMiddleware.loggedMiddleware,
   authMiddleware.isAdmin,
  oeuvresController.statistiqueParOeuvre
);

router.post(
  "/",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  oeuvresController.ajout
);
router.get(
  "/",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  oeuvresController.getoeuvre
);
router.get(
  "/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  oeuvresController.getoeuvrebyId
);
router.delete(
  "/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  oeuvresController.deleteoeuvre
);
router.patch(
  "/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  oeuvresController.updateoeuvre
);

module.exports = router;
