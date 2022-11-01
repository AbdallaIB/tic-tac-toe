import * as dotenv from 'dotenv';
import { resolve } from 'path';

// load environment variables from .env file
dotenv.config({ path: resolve('.env') });

// set the node environment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

// handle uncaught errors
process.on('uncaughtException', function (err) {
  console.error('[script]', err);
});

// extend the base configuration in core.js with environment specific configuration
export { core as config } from '@config/env/core';

console.info(`_______________________________(${process.env.NODE_ENV} environment)_______________________________`);
