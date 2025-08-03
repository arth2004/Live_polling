import express from 'express';
import http from 'http';
import cors from 'cors';
import initSockets from './sockets/index.js'
import { PORT } from './config/index.js';

const app = express();
app.use(cors());
app.use(express.json());

// import pollsRouter from './routes/polls.js';
// app.use('/api/polls', pollsRouter);

const server = http.createServer(app);
initSockets(server);

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
