const express = require("express");
const router = express.Router();
const SaisonController = require("../controllers/saison");
const ConcertController = require("../controllers/concert");

const authMiddleware=require("../middlewares/auth");

router.post("/createsaison", 
// authMiddleware.loggedMiddleware,authMiddleware.isAdmin, 
SaisonController.createSaison);
router.get("/getsaisons", 
// authMiddleware.loggedMiddleware,authMiddleware.isAdmin, 
SaisonController.getSaison);
router.delete("/deleteSaison/:id", 
// authMiddleware.loggedMiddleware,authMiddleware.isAdmin, 
SaisonController.deleteSaison);
router.patch("/updatesaison/:id",
//  authMiddleware.loggedMiddleware,authMiddleware.isAdmin, 
 SaisonController.updateSaison);
router.get("/getsaisonbyid/:id", 
// authMiddleware.loggedMiddleware,authMiddleware.isAdmin, 
SaisonController.getSaisonbyId);

router.patch('/updateSeuils/:saisonId',authMiddleware.loggedMiddleware, authMiddleware.isAdmin, SaisonController.updateSeuils);
router.get("/getListeNominationSaisonActuelle/:saisonId",authMiddleware.loggedMiddleware, authMiddleware.isAdmin,SaisonController.getListeNominations);
router.get("/getListeEliminationSaisonActuelle/:saisonId",authMiddleware.loggedMiddleware, authMiddleware.isAdmin,SaisonController.getListeEliminations);
router.patch("/updateDureeElimination/:saisonId",authMiddleware.loggedMiddleware, authMiddleware.isAdmin,SaisonController.updateDureeElimination);

router.get('/programmes',ConcertController.getConcertsForActiveSeason)


module.exports = router;
