import express from "express";
import upload from "../middleware/cloudinaryUpload.js";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  creatorAuth,
  editorProjects,
  editorAcceptInvite,
  logout,
  rotateRefreshToken,
  getUserInfo,
  createProject,
  getProjectVideos,
  approveVideo,
  getCreatorProjects,
  uploadToYouTube,
  cloudinarySign,
  signedDataUpdate
} from "../controller/creatorController.js";

const creatorRouter = express.Router();

// Public routes
creatorRouter.get("/sign-in", creatorAuth);
creatorRouter.post("/refresh-token", rotateRefreshToken);

// Protected routes
creatorRouter.get("/me", authMiddleware, getUserInfo);
creatorRouter.post("/logout", authMiddleware, logout);
creatorRouter.post("/projects", authMiddleware, upload.single("video"), createProject);
creatorRouter.get("/projects", authMiddleware, getCreatorProjects);
creatorRouter.get("/projects/:projectId/videos", authMiddleware, getProjectVideos);
creatorRouter.put("/videos/:videoId/approve", authMiddleware, approveVideo);
creatorRouter.get("/editor/projects", authMiddleware, editorProjects);
creatorRouter.post("/invite/accept", authMiddleware, editorAcceptInvite);
creatorRouter.post("/videos/upload-to-youtube", authMiddleware, uploadToYouTube);

creatorRouter.get("/cloudinary-sign", authMiddleware, cloudinarySign);
creatorRouter.post("/signed-data", authMiddleware, signedDataUpdate);

export default creatorRouter;