import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'unsafe-dev-secret',
  fivemApiKey: process.env.FIVEM_API_KEY || 'dev-key',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@dragon.local',
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  staffSaltRounds: Number(process.env.STAFF_SALT_ROUNDS || 10),
};
