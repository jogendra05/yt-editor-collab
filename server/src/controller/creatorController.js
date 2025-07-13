import express from "express";
import { google } from "googleapis";
import { Video, Project, User } from "../models/schema.js";
import fs from "fs";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "../utils/jwt.js";

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
  try {
    const { code } = req.query;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Fetch user email from Google
    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        role: "creator",
        youtubeTokens: tokens,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (!user) {
      return res.status(500).send("Invalid credentials");
    }

    const accessToken = signAccessToken({ sub: user._id });
    const refreshToken = signRefreshToken({ sub: user._id });

    user.refresh_token = { token: refreshToken, createdAt: Date.now() };
    await user.save();

    return res
      .cookie("yteditor", refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        // sameSite: "strict",
      })
      .status(200)
      .json({
        accessToken,
      });
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    return res.status(500).send("Authentication failed. Please try again.");
  }
};

export const rotateRefreshToken = async (req, res) => {
  try {
    const token = req.cookies.yteditor;
    if (!token) return res.status(401).json({ success: false, accessToken: "" });

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res.status(403).json({ success: false, accessToken: "" });
    }

    const user = await User.findById(payload.sub);
    if (!user || user.refresh_token.token !== token) {
      return res.status(403).json({ ok: false, accessToken: "" });
    }

    // Rotate: issue new pair
    const newAccessToken = signAccessToken({ sub: user._id });
    const newRefreshToken = signRefreshToken({ sub: user._id });

    user.refresh_token = { token: newRefreshToken, createdAt: Date.now() };
    await user.save();

    res
      .cookie("yteditor", newRefreshToken, {
        httpOnly: true,
        // sameSite: "strict",
        // secure: process.env.NODE_ENV === "production",
        // path: "/refresh_token",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error rotating refresh token:", error);
    return res.status(500).json({ ok: false, accessToken: "" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.yteditor;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.sub, { $unset: { refreshToken: '' } });
    } catch {}
  }
  res.clearCookie('yteditor').json({ message: 'Logged out' });
}

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

// export const creatorRouter = async (req, res) => {
//     try {
//       const { project_id } = req.body;

//       if (!project_id || !req.file) {
//         return res.status(400).json({ error: "Project ID and video file are required" });
//       }

//       const project = await Project.findOne({ _id: project_id, creator_id: req.userId });
//       if (!project) {
//         return res.status(403).json({ error: "Unauthorized: not your project" });
//       }

//       const video = await Video.create({
//         project_id,
//         uploaded_by: req.userId,
//         s3_key: req.file.path,
//         status: "pending"
//       });

//       res.status(201).json({ message: "Video uploaded successfully", video });
//     } catch (err) {
//       console.error(err);
//       res.status(500).json({ error: "Video upload failed" });
//     }
//   }
