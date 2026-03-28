import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { loginSchema } from '../utils/validators.js';
import { store } from '../services/store.js';

const router = Router();

router.post('/login', async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.message });

  const user = store.users.find((u) => u.username === value.username);
  if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

  const ok = await bcrypt.compare(value.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

  const token = jwt.sign(
    { id: user.id, username: user.username, staffLevel: user.staffLevel },
    env.jwtSecret,
    { expiresIn: '12h' }
  );

  return res.json({ token, staffLevel: user.staffLevel, username: user.username });
});

export default router;
