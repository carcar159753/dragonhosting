import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token ausente.' });
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido.' });
  }
}

export function requireLevel(minLevel) {
  return (req, res, next) => {
    if (!req.user || req.user.level < minLevel) {
      return res.status(403).json({ error: 'Nível insuficiente.' });
    }
    return next();
  };
}
