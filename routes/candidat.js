const express = require("express");
const router = express.Router();
const candidatController = require("../controllers/candidat");
const requestValidator = require("../middlewares/request_validator/candidat");
const authMiddleware = require("../middlewares/auth");

router.post("/", candidatController.postCandidat);

router.get(
  "/",
  requestValidator.validateQueryParams,
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  candidatController.getCandidats
);
router.post(
  "/saisieInfos/:id",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  candidatController.SaisieInfos
);
router.get(
  "/accepted",
  requestValidator.candidatRetenu,
  candidatController.filterAcceptedCandidates
);
router.patch(
  "/accept/:id",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  candidatController.acceptCandidat
);
router.patch(
  "/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  candidatController.updateCandidat
);
router.get("/confirm/:id", candidatController.confirm);
router.get("/reject/:id", candidatController.reject);
router.post("/sendmail", candidatController.sentmail);
router.get("/confirmation", candidatController.confirmation);

module.exports = router;
