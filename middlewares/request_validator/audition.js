const Joi = require("joi");
const moment = require("moment");

const Planification2Validator = Joi.object({
  auditionId: Joi.string().length(24).required(),
  dateDebut: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required(),
  dateFin: Joi.string().pattern(/^\d{2}\/\d{2}\/\d{4}$/).required(),
  listeCandidat: Joi.array().required(),

}).custom((value, helpers) => {
  const { dateDebut, dateFin } = value;

  if (moment(dateDebut, "DD/MM/YYYY").isAfter(moment(dateFin, "DD/MM/YYYY"))) {
    return helpers.error('any.invalid', { dateDebut, dateFin });
  }

  return value;
}, 'date validation');

const PlanificationValidator = Joi.object({
  auditionId: Joi.string().length(24).required(),
});

const validateAuditionPlanification2 = (req, res, next) => {
  const { error } = Planification2Validator.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

const validateAuditionPlanification = (req, res, next) => {
  const { error } = PlanificationValidator.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = { validateAuditionPlanification2, validateAuditionPlanification };
