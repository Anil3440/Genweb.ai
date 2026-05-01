import express from "express"
import isAuth from "../middlewares/isAuth.js";
import { changes, deploy, generateWebsite, getAll, getWebsiteById, getWebsiteBySlug } from "../controllers/website.controller.js";

const websiteRouter = express.Router();

websiteRouter.post('/generate',isAuth,generateWebsite);
websiteRouter.get('/get-by-id/:id',isAuth,getWebsiteById);
websiteRouter.get('/get-all',isAuth,getAll);
websiteRouter.post('/update/:id',isAuth,changes);
websiteRouter.get('/deploy/:id',isAuth,deploy);
websiteRouter.get('/get-by-slug/:slug',getWebsiteBySlug);

export default websiteRouter
