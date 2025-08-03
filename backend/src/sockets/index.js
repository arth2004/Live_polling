import { Server } from 'socket.io';
import bindPollHandlers from './pollHandlers.js';

function initSockets(server) {
  const io = new Server(server, { cors: { origin: '*', methods: ['GET','POST'] } });
  io.on('connection', socket => {
    console.log(`→ connected: ${socket.id}`);
    bindPollHandlers(io, socket);
    socket.on('disconnect', () => {
      // call a cleanup service method to remove from any sessions
    });
  });
  return io;
}

export default initSockets;