import express from 'express';
import { googleAuth, logOut } from '../controllers/auth.controller.js';
import { authLimiter } from '../middlewares/rateLimiter.js';

const authRouter = express.Router();

authRouter.post('/google', authLimiter, googleAuth);
authRouter.post('/logout', logOut);

export default authRouter;