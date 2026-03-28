import http from 'node:http';
import jwt from 'jsonwebtoken';
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

io.use((socket, next) => {
  const bearerHeader = socket.handshake.headers.authorization;
  const bearerToken = bearerHeader?.startsWith('Bearer ') ? bearerHeader.slice(7) : null;
  const token = socket.handshake.auth?.token || bearerToken;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    socket.data.user = jwt.verify(token, env.jwtSecret);
    return next();
  } catch {
    return next(new Error('Invalid token'));
  }
});

const app = createApp(io, makeFiveMRoutes);
server.on('request', app);

io.on('connection', (socket) => {
  socket.emit('system:hello', {
    message: 'Dragon panel conectado.',
    user: socket.data.user,
  });
});

server.listen(env.port, () => {
  console.log(`[dragon-backend] running on :${env.port}`);
});
