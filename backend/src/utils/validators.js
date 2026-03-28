import Joi from 'joi';

export const loginSchema = Joi.object({
  username: Joi.string().min(3).max(32).required(),
  password: Joi.string().min(6).max(72).required()
});

export const positionSchema = Joi.object({
  source: Joi.number().required(),
  name: Joi.string().allow('').required(),
  coords: Joi.object({
    x: Joi.number().required(),
    y: Joi.number().required(),
    z: Joi.number().required()
  }).required(),
  speed: Joi.number().required(),
  heading: Joi.number().required(),
  history: Joi.array().items(Joi.object()).default([]),
  behaviorScore: Joi.number().default(0),
  timestamp: Joi.number().required()
});

export const flagSchema = Joi.object({
  source: Joi.number().required(),
  player: Joi.string().required(),
  flag: Joi.string().required(),
  flags: Joi.number().required(),
  evidence: Joi.any(),
  timestamp: Joi.number().required()
});

export const reportSchema = Joi.object({
  reporter: Joi.string().min(2).required(),
  accused: Joi.string().min(2).required(),
  reason: Joi.string().min(4).required()
});
