const express = require("express");
const router = express.Router();
const ConcertController = require("../controllers/concert");
const uploadMiddleware = require("../middlewares/upload");
const uploadExcelMiddleware = require("../middlewares/excelUpload");
const authMiddleware=require("../middlewares/auth");


router.get('/statistiqueParConcert' , /*authMiddleware.loggedMiddleware,
authMiddleware.isAdmin, */ConcertController.statistiqueParConcert);


router.post(
  "/",
  uploadMiddleware.single("affiche"),
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  ConcertController.addConcert
);
router.get(
  "/",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  ConcertController.getConcerts
);
router.get(
  "/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  ConcertController.getConcert
);
router.patch(
  "/:id",
  uploadMiddleware.single("affiche"),
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  ConcertController.updateConcert
);
router.patch(
  "/informerAbsence/:id",
  authMiddleware.loggedMiddleware,
  ConcertController.informerAbsence
);
router.delete(
  "/:id",
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  ConcertController.deleteConcert
);
router.delete(
  "/deleteAll",
  authMiddleware.loggedMiddleware,
  authMiddleware.isAdmin,
  ConcertController.deleteAllConcerts
);
router.post(
  "/addExcel",
  uploadExcelMiddleware.single("excelFile"),
  // authMiddleware.loggedMiddleware,
  // authMiddleware.isAdmin,
  ConcertController.excelFile
);
router.patch("/seuilconcert/:id", ConcertController.SaveSeuilconcert);

module.exports = router;

///api/concert
