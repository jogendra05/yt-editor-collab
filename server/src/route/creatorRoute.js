import express from "express";
import { creatorAuth, creatorCallback, uploadVideo } from "../controller/creatorController.js";

const creatorRouter = express.Router();
creatorRouter.get("/auth", creatorAuth)
creatorRouter.get("/oauth2callback", creatorCallback);
creatorRouter.get("/upload", uploadVideo); 

export default creatorRouter;