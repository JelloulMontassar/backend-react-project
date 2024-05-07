const express = require("express");
const router = express.Router();
const repititionController = require("../controllers/repitition");
const authMiddleware = require("../middlewares/auth");

router.get(
  "/",
  // authMiddleware.loggedMiddleware,
  repititionController.getAll
);
router.get(
  "/:id",
  // , authMiddleware.loggedMiddleware
  repititionController.getById
);
router.post(
  "/",
  // authMiddleware.loggedMiddleware,authMiddleware.isAdmin,
  repititionController.create
);
router.delete(
  "/:id",
//   authMiddleware.loggedMiddleware,
//   authMiddleware.isAdmin,
  repititionController.remove
);
router.patch(
  "/informerAbsence/:id",
//   authMiddleware.loggedMiddleware,
//   authMiddleware.isChoriste,
  repititionController.informerAbsence
);
router.patch(
  "/:id",
//   authMiddleware.loggedMiddleware,
//   authMiddleware.isAdmin,
  repititionController.update
);

module.exports = router;
