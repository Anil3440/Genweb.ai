import redis from '../config/redis.js';

/**
 * Cache middleware factory.
 *
 * Usage: router.get('/path', isAuth, cache(keyFn, TTL), controller)
 *
 * @param {Function} keyFn  - receives (req) and returns the Redis cache key string
 * @param {number}   ttl    - time-to-live in seconds
 */
const cache = (keyFn, ttl) => async (req, res, next) => {
  try {
    const key = keyFn(req);
    const cached = await redis.get(key);

    if (cached) {
      res.setHeader('X-Cache', 'HIT');
      return res.status(200).json(JSON.parse(cached));
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);

    res.json = (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        redis
          .setex(key, ttl, JSON.stringify(data))
          .catch(() => {});
      }
      return originalJson(data);
    };

    next();
  } catch (err) {
    next();
  }
};

export default cache;
