import express from "express";
import { google } from "googleapis";
import { Video, Project, User } from "../models/schema.js";
import fs from "fs";

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

export const creatorAuth = async (req, res) => {
  // Scopes required for uploading videos
  const SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  res.redirect(url);
};

export const creatorCallback = async (req, res) => {
  const { code } = req.query;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Save tokens for later (in DB or file)
  // fs.writeFileSync("tokens.json", JSON.stringify(tokens));

  // Fetch user email from Google
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;

  // 7. Upsert user record in MongoDB
  const user = await User.findOneAndUpdate(
    { email },
    {
      email,
      role: "creator",
      youtubeTokens: tokens,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.send("Authentication successful! You can close this window.");
};

export const uploadVideo = async (req, res) => {
  try {
    const tokens = JSON.parse(fs.readFileSync("tokens.json"));
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const response = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: "Test Video",
          description: "Uploaded via API",
        },
        status: {
          privacyStatus: "public",
        },
      },
      media: {
        body: fs.createReadStream("./try.mp4"),
      },
    });

    res.send("Video uploaded: " + response.data.id);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).send("Upload failed");
  }
};

export const creatorRouter = async (req, res) => {

  /**
 * POST /api/projects/with-video
 * multipart/form-data:
 *   • name        = "My New Series"
 *   • editorEmail = "edit@mail.com"
 *   • video       = file
 */
    try {
      const { name, editorEmail } = req.body;
      if (!name || !editorEmail || !req.file)
        return res.status(400).json({ error: "name, editorEmail and video are required" });

      /* 1️⃣  Create the project */
      const project = await Project.create({
        name,
        creator_id: req.userId
      });

      /* 2️⃣  Ensure editor exists (create user if first time) */
      let editor = await User.findOne({ email: editorEmail });
      if (!editor) {
        editor = await User.create({ email: editorEmail, role: "editor" }); // password blank — will set later
      }

      /* 3️⃣  Create or update Invite to accepted */
      await Invite.findOneAndUpdate(
        { project_id: project._id, email: editorEmail },
        { project_id: project._id, email: editorEmail, status: "accepted" },
        { upsert: true, new: true }
      );

      /* 4️⃣  Save the video and assign to editor */
      const video = await Video.create({
        project_id: project._id,
        uploaded_by: req.userId,
        assigned_to: editor._id,
        s3_key: req.file.path, // Cloudinary URL
        status: "pending"
      });

      res.status(201).json({
        message: "Project, invite, and video created",
        project,
        editor,
        video
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create project with video" });
    }
  }
  


