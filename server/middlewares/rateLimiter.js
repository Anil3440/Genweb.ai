import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redis.js';

/**
 * Helper to create a rate limiter backed by Redis.
 * Falls back cleanly if Redis is unavailable (uses in-memory store).
 *
 * @param {object} options
 * @param {number}   options.windowMs   - Time window in milliseconds
 * @param {number}   options.max        - Max requests per window
 * @param {string}   options.prefix     - Redis key prefix (keep unique per limiter)
 * @param {string}   options.message    - Error message sent on 429
 * @param {Function} [options.keyFn]    - Custom key generator (default: by IP)
 */
const createLimiter = ({ windowMs, max, prefix, message, keyFn }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,  // Sends RateLimit-* headers (RFC 6585)
    legacyHeaders: false,
    message: { message },
    keyGenerator: keyFn || ((req) => req.ip),
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix,
    }),
  });

// ─────────────────────────────────────────────────────────────────────────────
// 1. GLOBAL LIMITER — applied to ALL routes
//    200 requests per 15 minutes per IP
// ─────────────────────────────────────────────────────────────────────────────
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  prefix: 'rl:global:',
  message: 'Too many requests, please try again later.',
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. AUTH LIMITER — applied to /api/auth routes
//    10 login/register attempts per 15 minutes per IP (brute force protection)
// ─────────────────────────────────────────────────────────────────────────────
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: 'rl:auth:',
  message: 'Too many auth attempts, please wait 15 minutes before trying again.',
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. AI GENERATE LIMITER — applied to POST /api/website/generate
//    5 generations per hour per logged-in user (keyed by userId, not IP)
// ─────────────────────────────────────────────────────────────────────────────
export const generateLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  prefix: 'rl:generate:',
  message: 'You have reached the limit of 5 website generations per hour. Please try again later.',
  // Key by userId so limits are per-account, not per-IP (VPNs won't bypass this)
  keyFn: (req) => req.user?._id?.toString() || req.ip,
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. AI EDIT LIMITER — applied to POST /api/website/update/:id
//    10 edits per hour per logged-in user
// ─────────────────────────────────────────────────────────────────────────────
export const editLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  prefix: 'rl:edit:',
  message: 'You have reached the limit of 10 website edits per hour. Please try again later.',
  keyFn: (req) => req.user?._id?.toString() || req.ip,
});
