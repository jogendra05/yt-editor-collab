import express from "express";
// import { verifyGoogleToken } from "../middleware/googleAuth.js";
// import { requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";
import {
  creatorAuth,
  logout,
  rotateRefreshToken,
  publishVideo,
} from "../controller/creatorController.js";

const creatorRouter = express.Router();

creatorRouter.get("/sign-in", creatorAuth);
creatorRouter.get("/upload", publishVideo);
creatorRouter.post("/refresh-token", rotateRefreshToken);
creatorRouter.post("logout", logout);
// creatorRouter.post( "/send-video",verifyGoogleToken,requireRole("creator"),upload.single("video"),creatorRouter);

export default creatorRouter;
