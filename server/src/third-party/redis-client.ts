import { createClient } from 'redis';
import { config } from '@config/config';
const moduleName = '[redis-client] ';
import loggerHandler from '@utils/logger';
const logger = loggerHandler(moduleName);

type Result = { success: boolean; data?: any | null; msg?: string };

let RedisClient;
if (config.node_env === 'production') {
  const host = config.redis_config.host;
  const port = Number(config.redis_config.port);
  const username = config.redis_config.username;
  const password = config.redis_config.password;
  const url = `redis://${username}:${password}@${host}:${port}`;

  RedisClient = createClient(url, { tls: {} });
} else {
  RedisClient = createClient();
}

RedisClient.on('connect', function () {
  logger.info('Connected successfully.');
});

RedisClient.on('error', function (err) {
  logger.info('[error]', err);
});

export const setHashMap = async (key: string, field: string, val: any) => {
  return new Promise<Result>((resv, rej) => {
    RedisClient.hmset(key, field, val, (e) => {
      if (e) {
        logger.error('[setHashMap][e]', e.message);
        return rej({ success: false, data: null, msg: e.message });
      }
      resv({ success: true });
    });
  });
};

export const deleteHashMap = async (key: string, field: string) => {
  return new Promise<Result>((resv, rej) => {
    RedisClient.hdel(key, field, (e) => {
      if (e) {
        logger.error('[deleteHashMap][e]', e.message);
        return rej({ success: false, data: null, msg: e.message });
      }
      resv({ success: true });
    });
  });
};

export const getHashMap = async (key: string, field: string) => {
  return new Promise<Result>((resv, rej) => {
    RedisClient.hmget(key, field, (e, data) => {
      if (e) {
        logger.error('[getHashMap][e]', e.message);
        resv({ success: false, data: null, msg: e.message });
      }
      resv({ success: data && data[0], data: data && data[0] ? data[0] : null });
    });
  });
};
