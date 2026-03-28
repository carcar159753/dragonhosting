import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import authRoutes from './routes/authRoutes.js';
import panelRoutes from './routes/panelRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp(io, fiveMRoutesFactory) {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '2mb' }));

  app.use('/api/auth', authRoutes);
  app.use('/api/panel', panelRoutes);
  app.use('/api/fivem', fiveMRoutesFactory(io));

  app.use('/', express.static(path.resolve(__dirname, '../../web')));

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  return app;
}
