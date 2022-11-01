import * as path from 'path';

const dotenv = require('dotenv');

dotenv.config({ path: path.resolve('.env') });

// load configurations
// set the node environment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

// handle uncaught errors
process.on('uncaughtException', function (err) {
  console.error('[script]', err);
});

// extend the base configuration in core.js with environment specific configuration

console.info(`_______________________________(${process.env.NODE_ENV} environment)_______________________________`);
