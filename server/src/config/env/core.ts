import * as path from 'path';

const rootPath = path.normalize(`${__dirname}/../../..`);

export const core = {
  root: rootPath,
  node_env: process.env.NODE_ENV,
  redis_config: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
  },
};
