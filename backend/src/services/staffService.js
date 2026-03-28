import bcrypt from 'bcrypt';
import { store } from '../data/store.js';
import { env } from '../config/env.js';

export async function ensureDefaultAdmin() {
  if (store.staff.length > 0) return;

  const hash = await bcrypt.hash(env.adminPassword, env.staffSaltRounds);
  store.staff.push({
    id: 1,
    name: 'Administrador',
    email: env.adminEmail,
    role: 'owner',
    level: 100,
    passwordHash: hash,
  });
}

export async function validateCredentials(email, password) {
  const user = store.staff.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    level: user.level,
  };
}
