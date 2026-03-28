import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authRequired(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Token ausente' });

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function staffLevel(minLevel = 1) {
  return (req, res, next) => {
    if ((req.user?.staffLevel || 0) < minLevel) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    return next();
  };
}
