import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { changes, deploy, generateWebsite, getAll, getWebsiteById, getWebsiteBySlug } from "../controllers/website.controller.js";
import cache from "../middlewares/cache.js";
import { CacheKeys, TTL } from "../config/redis.js";
import { generateLimiter, editLimiter } from "../middlewares/rateLimiter.js";

const websiteRouter = express.Router();

// ── Write Routes ─────────────────────────────────────────────────────
// isAuth runs first so req.user is set → limiter can key by userId
websiteRouter.post('/generate', isAuth, generateLimiter, generateWebsite);
websiteRouter.post('/update/:id', isAuth, editLimiter, changes);
websiteRouter.get('/deploy/:id', isAuth, deploy);

// ── Read Routes (served from Redis cache when available) ─────────────
websiteRouter.get(
  '/get-by-id/:id',
  isAuth,
  cache((req) => CacheKeys.websiteById(req.user._id.toString(), req.params.id), TTL.WEBSITE_BY_ID),
  getWebsiteById
);

websiteRouter.get(
  '/get-all',
  isAuth,
  cache((req) => CacheKeys.allWebsites(req.user._id.toString()), TTL.ALL_WEBSITES),
  getAll
);

websiteRouter.get(
  '/get-by-slug/:slug',
  cache((req) => CacheKeys.websiteBySlug(req.params.slug), TTL.WEBSITE_BY_SLUG),
  getWebsiteBySlug
);

export default websiteRouter;
