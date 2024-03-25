const Joi = require("joi");

const defineNeedsValidator = Joi.object({
  name: Joi.string().valid("basse", "ténor", "alto", "soprano").required(),
  besoin: Joi.number().integer().positive().required(),
});

const defineNeeds = (req, res, next) => {
  const { name } = req.params;
  const { besoin } = req.body;
  console.log({ name, besoin });
  const { error } = defineNeedsValidator.validate({ name, besoin });

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};
module.exports = { defineNeeds };
