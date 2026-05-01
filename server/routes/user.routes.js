import express from 'express';
import { getCurrUser } from '../controllers/user.controller.js';
import isAuth from '../middlewares/isAuth.js';

const userRouter = express.Router();

userRouter.get('/profile',isAuth,getCurrUser);

export default userRouter;