import express from 'express';
import { creatorCallback } from './controller/creatorController.js';

const creatorRedirect = express.Router();

creatorRedirect.get("/oauth2callback", creatorCallback);

export default creatorRedirect;