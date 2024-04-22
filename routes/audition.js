const express = require("express");
const router = express.Router();
const AuditionController = require("../controllers/audition");
const requestValidator = require("../middlewares/request_validator/audition");
const authMiddleware = require("../middlewares/auth");

router.patch(
  "/:id",
  // authMiddleware.loggedMiddleware,authMiddleware.isAdmin,
  AuditionController.updateAudition
);
router.get(
  "/",
  // authMiddleware.loggedMiddleware,authMiddleware.isAdmin,
  AuditionController.getAudition
);
router.delete(
  "/:id",
  // authMiddleware.loggedMiddleware,authMiddleware.isAdmin,
  AuditionController.deleteAudition
);

router.post(
  "/",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  AuditionController.createAudition
);
router.get(
  "/planning/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  AuditionController.getPlanning
);
router.get('/getallaudition', AuditionController.getAuditions);

router.post(
  "/genererPlanification",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  requestValidator.validateAuditionPlanification,
  AuditionController.genererPlanification
);
router.post(
  "/genererPlanificationAbcents",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  requestValidator.validateAuditionPlanification2,
  AuditionController.genererPlanification2
);

module.exports = router;
