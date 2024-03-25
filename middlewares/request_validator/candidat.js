const Joi = require("joi");

const candidatRetenuValidator = Joi.object({
  order: Joi.number().valid(1, -1).required(),
});

const candidatRetenu = (req, res, next) => {
  const { order } = req.query;
  const { error } = candidatRetenuValidator.validate({ order });
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};
const queryParamsSchema = Joi.object({
  sexe: Joi.string().valid('homme', 'femme'),
  taillemin: Joi.number().positive(),
  taillemax: Joi.number().positive(),
  nom: Joi.string(),
  prenom: Joi.string(),
  telephone: Joi.string(),
  email: Joi.string().email(),
  id_national: Joi.string(),
  nationalite: Joi.string(),
  date_de_naissance: Joi.date(),
  situation_professionnelle: Joi.string(),
  page: Joi.number().positive(),
  limit: Joi.number().positive(),
});

const validateQueryParams = (req, res, next) => {
  const { error, value } = queryParamsSchema.validate(req.query);

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation des query params a échoué',
      error: error.details.map((detail) => detail.message),
    });
  }

  req.query = value; 
  next();
};
module.exports = { candidatRetenu,validateQueryParams };
