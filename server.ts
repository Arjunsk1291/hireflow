import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server as SocketServer } from 'socket.io';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketServer(httpServer, {
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth?.userId;
    if (!userId) return next(new Error('Not authenticated'));
    socket.data.userId = userId;
    next();
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);
    console.log(`🔌 Socket connected: user ${userId}`);
    socket.on('disconnect', () => console.log(`🔌 Socket disconnected: user ${userId}`));
  });

  (global as { io?: SocketServer }).io = io;

  const port = parseInt(process.env.PORT ?? '3000', 10);
  httpServer.listen(port, () => {
    console.log(`🚀 HireFlow running on http://localhost:${port}`);
  });
});
