import Redis from 'ioredis';

// ─── Connection Config ────────────────────────────────────────────────────────
// Production (Render + Upstash): set REDIS_URL in Render environment variables
// Local dev (Docker Desktop)   : uses REDIS_HOST + REDIS_PORT from .env
// ─────────────────────────────────────────────────────────────────────────────
const redisConfig = process.env.REDIS_URL
  ? {
      // Upstash / any cloud Redis — single URL covers everything
      lazyConnect: true,
    }
  : {
      // Local Docker Desktop
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
    };

const retryStrategy = (times) => {
  if (times > 3) return null; // stop retrying after 3 attempts
  return Math.min(times * 200, 2000);
};

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, { ...redisConfig, retryStrategy })
  : new Redis({ ...redisConfig, retryStrategy });

redis.on('connect', () => {
  const target = process.env.REDIS_URL
    ? 'Upstash (cloud Redis)'
    : `${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379} (Docker)`;
  console.log(`✅ Redis connected → ${target}`);
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});

// Cache key factory — keeps all keys consistent across the app
export const CacheKeys = {
  websiteById:   (userId, websiteId) => `website:${userId}:${websiteId}`,
  allWebsites:   (userId)            => `websites:${userId}`,
  websiteBySlug: (slug)              => `slug:${slug}`,
};

// TTL constants (in seconds)
export const TTL = {
  WEBSITE_BY_ID:   300,  // 5 minutes
  ALL_WEBSITES:    120,  // 2 minutes
  WEBSITE_BY_SLUG: 600,  // 10 minutes
};

export default redis;

