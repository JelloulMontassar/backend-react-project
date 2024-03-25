const Joi = require("joi");

const idNationalRegex = /^[0-9]{8}$|^[0-9]{10}$/;
const telephoneRegex = /^[0-9]{8}$/;

const updateUserValidator = Joi.object({
  nom: Joi.string().min(3),
  prenom: Joi.string().min(3),
  telephone: Joi.string().regex(telephoneRegex),
  email: Joi.string().min(3).email(),
  id_national: Joi.string().regex(idNationalRegex),
  nationalite: Joi.string().min(3),
  date_de_naissance: Joi.date(),
  situation_professionnelle: Joi.string().min(3),
  taille: Joi.number(),
  sexe: Joi.string().valid("homme", "femme"),
  role: Joi.string().valid(
    "choriste",
    "chef de pupitre",
    "chef de choeur",
    "manager",
    "admin"
  ),
  niveauExperience: Joi.string().valid("junior", "senior", "veteran"),
  status: Joi.string().valid("inactif", "actif"),
});

const updateStatusValidator = Joi.object({
  status: Joi.string().valid("inactif", "actif").required(),
});

const update = (req, res, next) => {
  const data = req.body;
  const { error } = updateUserValidator.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const updateStatus = (req, res, next) => {
  const data = req.body;
  const { error } = updateStatusValidator.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const getListesChoristesDisponiblesValidator = Joi.object({
  pupitre: Joi.string(),
});

const indiquerDisponibiliteValidator = Joi.object({
  disponibilite: Joi.boolean().required(),
});

const validateIndiquerDisponibilite = (req, res, next) => {
  const { error, value } = indiquerDisponibiliteValidator.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de indiquerDisponibilite a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

const validateGetListesChoristesDisponibles = (req, res, next) => {
  const { error, value } = getListesChoristesDisponiblesValidator.validate(
    req.query
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de getListesChoristesDisponibles a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.query = value;
  next();
};

const indiquerPresenceManuelleRepValidator = Joi.object({
  userId: Joi.string().required(),
  repetitionId: Joi.string().required(),
  raison: Joi.string(),
});

const validateIndiquerPresenceManuelleRep = (req, res, next) => {
  const { error, value } = indiquerPresenceManuelleRepValidator.validate(
    req.body
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de indiquerPresenceManuelleRep a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};
const indiquerPresenceManuelleConValidator = Joi.object({
  userId: Joi.string().required(),
  concertId: Joi.string().required(),
  raison: Joi.string(),
});

const validateIndiquerPresenceManuelleCon = (req, res, next) => {
  const { error, value } = indiquerPresenceManuelleConValidator.validate(
    req.body
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de indiquerPresenceManuelleCon a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

const presenceConcertValidator = Joi.object({
  code: Joi.string().required(),
});

const validatePresenceConcert = (req, res, next) => {
  const { error, value } = presenceConcertValidator.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de presenceConcert a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};

const presenceRepetitionValidator = Joi.object({
  code: Joi.string().required(),
});

const validatePresenceRepetition = (req, res, next) => {
  const { error, value } = presenceRepetitionValidator.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de presenceRepetition a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.body = value;
  next();
};
const getListeAbsenceRepetitionsValidator = Joi.object({
  saison: Joi.string(),
  date: Joi.string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/)
    .allow(""),
  id: Joi.string(),
  pupitre: Joi.string(),
  oeuvre: Joi.string(),
});
const validateGetListeAbsenceRepetitions = (req, res, next) => {
  const { error, value } = getListeAbsenceRepetitionsValidator.validate(
    req.query
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de getListeAbsenceRepetitions a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.query = value;
  next();
};
const getUserActivityHistoryValidator = Joi.object({
  saison: Joi.string(),
  oeuvre: Joi.string(),
});

const getAllUserActivityHistoryValidator = Joi.object({
  id: Joi.string(),
  saison: Joi.string(),
  oeuvre: Joi.string(),
});

const validateGetAllUserActivityHistory = (req, res, next) => {
  const { error, value } = getAllUserActivityHistoryValidator.validate(
    req.query
  );

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de getAllUserActivityHistory a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.query = value;
  next();
};
const validateGetUserActivityHistory = (req, res, next) => {
  const { error, value } = getUserActivityHistoryValidator.validate(req.query);

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation de getUserActivityHistoryValidator a échoué",
      error: error.details.map((detail) => detail.message),
    });
  }

  req.query = value;
  next();
};
module.exports = {
  update,
  updateStatus,
  validateIndiquerDisponibilite,
  validateGetListesChoristesDisponibles,
  validateIndiquerPresenceManuelleRep,
  validateIndiquerPresenceManuelleCon,
  validatePresenceConcert,
  validatePresenceRepetition,
  validateGetListeAbsenceRepetitions,
  validateGetUserActivityHistory,
  validateGetAllUserActivityHistory,
};
