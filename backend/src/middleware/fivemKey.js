import { env } from '../config/env.js';

export function requireFiveMKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== env.fivemApiKey) {
    return res.status(401).json({ error: 'API key inválida.' });
  }
  return next();
}
