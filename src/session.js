import { Redis } from '@upstash/redis';
import { logger } from './utils/logger.js';

const redis = new Redis({
  url:   process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const TTL = 30 * 60; // 30 minutes in seconds

const DEFAULT = {
  state: 'INIT',
  lang:  null,
  crop:  null,
  location: null,
};

export async function getSession(phone) {
  try {
    const data = await redis.get(`session:${phone}`);
    return data ?? { ...DEFAULT };
  } catch (err) {
    logger.error('getSession failed', { phone, error: err.message });
    return { ...DEFAULT };
  }
}

export async function setSession(phone, updates) {
  try {
    const current = await getSession(phone);
    const merged  = { ...current, ...updates };
    await redis.set(`session:${phone}`, merged, { ex: TTL });
    return merged;
  } catch (err) {
    logger.error('setSession failed', { phone, error: err.message });
    throw err;
  }
}

export async function clearSession(phone) {
  try {
    await redis.del(`session:${phone}`);
  } catch (err) {
    logger.error('clearSession failed', { phone, error: err.message });
    throw err;
  }
}
