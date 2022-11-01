import { createClient } from 'redis';
const moduleName = '[redis-client] ';
import loggerHandler from '@utils/logger';
const logger = loggerHandler(moduleName);

let RedisClient;
if (process.env.NODE_ENV === 'production') {
  const host = process.env.REDIS_HOST;
  const port = Number(process.env.REDIS_PORT);
  const username = process.env.REDIS_USERNAME;
  const password = process.env.REDIS_PASSWORD;
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
