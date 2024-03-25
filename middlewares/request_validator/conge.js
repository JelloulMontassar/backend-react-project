const Joi = require("joi");

const addCongeValidator = Joi.object({
  dateDebut: Joi.date().required(),
  dateFin: Joi.date().required().greater(Joi.ref("dateDebut")),
});
const dateValidator = Joi.object({
  date: Joi.date().required(),
});

const createConge = (req, res, next) => {
  const { error } = addCongeValidator.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
const updateConge = (req, res, next) => {
  const { dateDebut, dateFin } = req.body;
  let updateError;
  console.log(dateDebut , dateFin);
  if (dateDebut && dateFin) {
    
    const { error } = addCongeValidator.validate(req.body);
    updateError = error&&error.details[0].message;
  } else {
    if (dateDebut || dateFin) {
      const { error } = dateValidator.validate({
        date: dateDebut || dateFin,
      });
      updateError = error&&error.details[0].message;
    } else {
        updateError = 'Must enter start or end date !'
    }
  }

    if (updateError) {
      return res.status(400).json({ error: updateError });
    }
  next();
};
module.exports = { createConge, updateConge };
