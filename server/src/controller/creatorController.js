import { google } from "googleapis";
import fs from "fs";

export const creatorAuth = async (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI
  );

  // Scopes required for uploading videos
  const SCOPES = ["https://www.googleapis.com/auth/youtube.upload"];

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
  fs.writeFileSync("tokens.json", JSON.stringify(tokens));

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
