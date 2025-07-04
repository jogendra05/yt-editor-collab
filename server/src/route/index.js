import express from 'express';
import {creatorRouter} from '../controller/creator.js';

const router = express.Router();

router.post( "/send-video",verifyGoogleToken,requireRole("creator"),upload.single("video"),creatorRouter);


export default router;
