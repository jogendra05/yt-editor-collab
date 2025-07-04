import express from 'express';
import { creatorAuth, uploadVideo } from "../controller/creatorController.js";
// import { verifyGoogleToken } from "../middleware/googleAuth.js";
// import { requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";


const creatorRouter = express.Router();

creatorRouter.get("/auth", creatorAuth)
creatorRouter.get("/upload", uploadVideo); 
// creatorRouter.post( "/send-video",verifyGoogleToken,requireRole("creator"),upload.single("video"),creatorRouter);


export default creatorRouter;
