import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { validateCredentials } from '../services/staffService.js';
import { env } from '../config/env.js';

const router = Router();

router.post(
  '/login',
  [body('email').isEmail(), body('password').isString().isLength({ min: 6 })],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ error: 'Dados inválidos.', details: errors.array() });
    }

    const user = await validateCredentials(req.body.email, req.body.password);
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas.' });
    }

    const token = jwt.sign(user, env.jwtSecret, { expiresIn: '8h' });
    return res.json({ token, user });
  }
);

export default router;
