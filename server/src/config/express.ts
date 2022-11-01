const moduleName = '[express]';
import * as express from 'express';
import * as path from 'path';
import * as cors from 'cors';
import loggerHandler from '@utils/logger';
const logger = loggerHandler(moduleName);

const expressApp = express();

// Set Request Parsing
expressApp.use(express.json({ limit: '10kb' }));
expressApp.use(express.urlencoded({ extended: false }));

// Cors
const origin = process.env.NODE_ENV !== 'production' ? '*' : process.env.REACT_CLIENT_ORIGIN;
const corsOptions = {
  origin: origin,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
expressApp.use(cors(corsOptions));

// Static resources
expressApp.use(express.static(path.resolve('public')));
expressApp.use(express.static(path.resolve('uploads')));

expressApp.use(function (req, res, next) {
  // Allowed Origin and Methods, and Headers

  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'HEAD, PUT, POST, GET, OPTIONS, DELETE');
  res.header('Access-Control-Allow-Headers', 'origin, content-type, Authorization, x-access-token');
  if (req.method === 'OPTIONS') {
    logger.error('[Express][Invalid Request][Method]', req.method);
    return res.status(405).send().end();
  }
  next();
});

expressApp.get('/', function (req, res) {
  res.sendFile(`${path.resolve('public')}/index.html`);
});

// Routes namespace
expressApp.use('/api/v1', function (req, res) {
  res.status(404).send('Not Found');
});

export const app = expressApp;
