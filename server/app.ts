import { connectRedis } from './src/third-party/redis-client';
import { app } from './src/config/express';
const moduleName = '[app] ';
import 'reflect-metadata';
import * as express from 'express';
import loggerHandler from './src/utils/logger';
const logger = loggerHandler(moduleName);
import { Server } from 'socket.io';
import * as fs from 'fs';
import * as https from 'https';
import * as http from 'http';
import '@config/config';
import { useSocketServer } from 'socket-controllers';

app.use(express.static(__dirname, { dotfiles: 'allow' }));

if (process.env.SECURE_ENABLED === 'true') {
  // Certificate
  const privateKey = fs.readFileSync(process.env.SSL_CERTS_PRIVATE_KEY!, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERTS_CERTIFICATE!, 'utf8');
  const ca = fs.readFileSync(process.env.SSL_CERTS_CHAIN!, 'utf8');

  const options = {
    key: privateKey,
    cert: certificate,
    ca,
  };
  const httpsServer = https.createServer(options, app);

  httpsServer.listen(process.env.HTTPS_PORT);
  logger.info('Https server is listening at', process.env.HTTPS_PORT);

  // Make global object of socket.io
  const socket = new Server(httpsServer, {
    cors: {
      origin: process.env.SOCKET_CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Init redis
  connectRedis();

  useSocketServer(socket, { controllers: [__dirname + '/src/controllers/socket.ts'] }); // socket.io engine params , {"pingInterval": 2000, "pingTimeout": 5000}
} else {
  const httpServer = http.createServer(app);
  httpServer.listen(process.env.PORT);
  logger.info('Http server is listening at', process.env.PORT);

  // Make global object of socket.io
  const socket = new Server(httpServer, {
    cors: {
      origin: process.env.SOCKET_CLIENT_ORIGIN,
      methods: ['GET', 'POST'],
    },
  });

  // Init redis
  connectRedis();

  useSocketServer(socket, { controllers: [__dirname + '/src/controllers/socket.ts'] }); // socket.io engine params , {"pingInterval": 2000, "pingTimeout": 5000}
}
