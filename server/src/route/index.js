import express from 'express';
import {creatorRouter} from '../controller/creator.js';
import { verifyGoogleToken } from "../middleware/googleAuth.js";
import { requireRole } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post( "/send-video",verifyGoogleToken,requireRole("creator"),upload.single("video"),creatorRouter);


export default router;
