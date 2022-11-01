import { createClient } from 'redis';
import { config } from '@config/config';
const moduleName = '[redis-client] ';
import loggerHandler from '@utils/logger';
const logger = loggerHandler(moduleName);

let RedisClient;
if (config.node_env === 'production') {
  const host = config.redis_config.host;
  const port = config.redis_config.port;
  const username = config.redis_config.username;
  const password = config.redis_config.password;
  const url = `${username}:${password}@${host}:${port}`;

  RedisClient = createClient({
    url,
  });
} else {
  RedisClient = createClient();
}

export const connectRedis = () => {
  RedisClient.connect();
};

RedisClient.on('connect', function () {
  logger.info('Connected successfully.');
});

RedisClient.on('error', function (err) {
  logger.info('[error]', err);
});

export const setHashMap = async (key: string, field: string, val: any, cb: (success: boolean) => void) => {
  try {
    await RedisClient.hSet(key, field, val);
    return cb(true);
  } catch (err) {
    logger.error('[setHashMap][e]', err.message);
    return cb(false);
  }
};

export const deleteHashMap = async (key: string, field: string) => {
  try {
    await RedisClient.hDel(key, field);
  } catch (err) {
    logger.error('[deleteHashMap][e]', err.message);
  }
};

export const getHashMap = async (key: string, field: string, cb: (success: boolean, data: string[]) => void) => {
  try {
    const data = await RedisClient.hmGet(key, field);
    if (!data) {
      return cb(false, []);
    }
    return cb(true, data);
  } catch (err) {
    logger.error('[getHashMap][e]', err.message);
    return cb(false, []);
  }
};
