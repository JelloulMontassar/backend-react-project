const Joi = require("joi");

const idNationalRegex = /^[0-9]{8}$|^[0-9]{10}$/;
const telephoneRegex = /^[0-9]{8}$/;

const loginValidator = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const registerValidator = Joi.object({
  nom: Joi.string().min(3).required(),
  prenom: Joi.string().min(3).required(),
  telephone: Joi.string().regex(telephoneRegex).required(),
  email: Joi.string().min(3).email().required(),
  id_national: Joi.string().regex(idNationalRegex).required(),
  nationalite: Joi.string().min(3).required(),
  date_de_naissance: Joi.date().required(),
  situation_professionnelle: Joi.string().min(3).required(),
  taille: Joi.number().required(),
  sexe: Joi.string().valid("homme", "femme").required(),
  role: Joi.string()
    .valid("choriste", "chef de pupitre", "chef de choeur", "manager", "admin")
    .required(),
});

const login = (req, res, next) => {
  const data = req.body;
  const { error } = loginValidator.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const register = (req, res, next) => {
  const data = req.body;
  console.log(data);
  const { error } = registerValidator.validate(data);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { login, register };
