import dotenv from 'dotenv';

dotenv.config();

function requireEnv(name, { disallow = [] } = {}) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }

  if (disallow.includes(value)) {
    throw new Error(`[env] Insecure value configured for ${name}. Set a unique secret/credential.`);
  }

  return value;
}

const portValue = process.env.PORT?.trim();
const parsedPort = Number(portValue || 3000);

if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
  throw new Error('[env] PORT must be a positive integer.');
}

export const env = {
  port: parsedPort,
  jwtSecret: requireEnv('JWT_SECRET', { disallow: ['unsafe-dev-secret'] }),
  fivemApiKey: requireEnv('FIVEM_API_KEY', { disallow: ['dev-key'] }),
  adminEmail: requireEnv('ADMIN_EMAIL', { disallow: ['admin@dragon.local'] }),
  adminPassword: requireEnv('ADMIN_PASSWORD', { disallow: ['ChangeMe123!'] }),
  staffSaltRounds: Number(process.env.STAFF_SALT_ROUNDS || 10),
};
