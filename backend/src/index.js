import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import authRoutes from './routes/auth.routes.js';
import privateRoutes from './routes/private.routes.js';
import internalRoutes from './routes/internal.routes.js';
import { env } from './config/env.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.resolve(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api', privateRoutes);
app.use('/api', internalRoutes);

app.get('/health', (_, res) => res.json({ ok: true }));
app.get('*', (_, res) => res.sendFile(path.resolve(__dirname, '../public/index.html')));

const server = app.listen(env.port, () => {
  console.log(`Dragon AC backend online na porta ${env.port}`);
});

const wss = new WebSocketServer({ server, path: '/ws' });
const wsBroadcast = (data) => {
  const message = JSON.stringify(data);
  for (const client of wss.clients) {
    if (client.readyState === 1) client.send(message);
  }
};
app.set('wsBroadcast', wsBroadcast);

setInterval(() => {
  wsBroadcast({ type: 'heartbeat', payload: Date.now() });
}, 15000);
