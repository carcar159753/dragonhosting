import http from 'node:http';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { createApp } from './app.js';
import makeFiveMRoutes from './routes/fivemRoutes.js';
import { ensureDefaultAdmin } from './services/staffService.js';

await ensureDefaultAdmin();

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const app = createApp(io, makeFiveMRoutes);
server.on('request', app);

io.on('connection', (socket) => {
  socket.emit('system:hello', { message: 'Dragon panel conectado.' });
});

server.listen(env.port, () => {
  console.log(`[dragon-backend] running on :${env.port}`);
});
