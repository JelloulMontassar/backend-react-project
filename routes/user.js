const userController = require("../controllers/user");
const express = require("express");
const router = express.Router();
const requestValidator = require("../middlewares/request_validator/user");
const authMiddleware = require("../middlewares/auth");

router.get("/consulterlisteChoriste", userController.getAllChoriste)

router.get('/statistiqueParChoriste/:id',authMiddleware.loggedMiddleware, authMiddleware.isAdmin,userController.statistiqueParChoriste);
router.get("/getAllUserActivityHistory", 
// authMiddleware.loggedMiddleware, authMiddleware.isAdmin, requestValidator.validateGetAllUserActivityHistory,*
//  authMiddleware.loggedMiddleware, 
 userController.getAllUserActivityHistory);
router.get("/ActivityHistory",
 authMiddleware.loggedMiddleware, 
 authMiddleware.isChoriste, 
//  requestValidator.validateGetUserActivityHistory, 
 authMiddleware.loggedMiddleware, 
 userController.getUserActivityHistory);

 router.get("/getStatutConge/:id", userController.getStatutConge);
 router.get("/repetitions", authMiddleware.loggedMiddleware, userController.getOwnRepititions);
 router.get("/concerts", authMiddleware.loggedMiddleware, userController.getOwnConcerts);
router.get("/getListeAbsenceRepetitions", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, requestValidator.validateGetListeAbsenceRepetitions, userController.getListeAbsenceRepetitions);
router.patch("/indiquerPresenceManuelleRep", authMiddleware.loggedMiddleware, authMiddleware.isChefDePupitre, requestValidator.validateIndiquerPresenceManuelleRep, userController.indiquerPresenceManuelleRep);
router.patch("/indiquerPresenceManuelleCon", authMiddleware.loggedMiddleware, authMiddleware.isChefDePupitre, requestValidator.validateIndiquerPresenceManuelleCon, userController.indiquerPresenceManuelleCon);
router.patch("/placement", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, userController.placementConcert)
router.get("/", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, userController.getAllUsers);
router.get("/:id", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, userController.getUserById);
router.patch("/updateStatus/:id", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, requestValidator.updateStatus, userController.updateUserById);
router.delete("/:id", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, userController.deleteUserById);
router.patch("/presenceConcert", authMiddleware.loggedMiddleware, authMiddleware.isChoriste, requestValidator.validatePresenceConcert, userController.presenceConcert);
router.patch("/presenceRepetition", authMiddleware.loggedMiddleware, authMiddleware.isChoriste, requestValidator.validatePresenceRepetition, userController.presenceRepitition);
router.patch("/:id", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, requestValidator.update, userController.updateUserById);
router.get("/consulterStatut/:id", authMiddleware.loggedMiddleware, userController.consulterStatut);
router.get("/consulterHistoriqueStatut/:id", authMiddleware.loggedMiddleware, authMiddleware.isAdmin,userController.consulterHistoriqueStatut);
router.get("/consulterHistoriqueStatutChoriste/:id", authMiddleware.loggedMiddleware, authMiddleware.isChoriste,userController.consulterHistoriqueStatutChoriste);
router.get("/consulterProfil/:id", authMiddleware.loggedMiddleware, authMiddleware.isChoristeOrAdmin, userController.consulterProfil);
router.patch("/indiquerDisponibilite/:id", authMiddleware.loggedMiddleware, authMiddleware.isChoriste, requestValidator.validateIndiquerDisponibilite, userController.indiquerDisponibilite);
router.get("/consulterListesChoristesDisponibles/:id", /*authMiddleware.loggedMiddleware,authMiddleware.isAdmin,requestValidator.validateGetListesChoristesDisponibles, */
    userController.getListesChoristesDisponibles);
router.get("/listeabsencechoriste/:authUserId/:choristeId", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, userController.getListeAbsenceChoriste);
router.post("/eliminerChoristeDicipline/:id", authMiddleware.loggedMiddleware, authMiddleware.isAdmin, userController.eliminerChoristeDicipline)


module.exports = router;
