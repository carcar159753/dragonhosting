import { env } from '../config/env.js';

export function apiSecretRequired(req, res, next) {
  if (req.headers['x-secret'] !== env.apiSecret) {
    return res.status(403).json({ error: 'Segredo inválido' });
  }
  return next();
}
