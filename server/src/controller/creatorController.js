import { google } from "googleapis";
import { Video, Project, User, Invite } from "../models/schema.js";
import fs from "fs";
import path from "path";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { v2 as cloudinary } from 'cloudinary';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.REDIRECT_URI
);

export const creatorAuth = async (req, res) => {
  try {
    const { role } = req.query;
    
    if (!role || !['creator', 'editor'].includes(role)) {
      return res.status(400).send("Invalid or missing role parameter");
    }

    const SCOPES = [
      "https://www.googleapis.com/auth/youtube.upload",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: role === "creator" ? SCOPES : SCOPES.slice(1),
      prompt: "consent",
      state: role,
      include_granted_scopes: true,
    });
    
    res.redirect(url);
  } catch (error) {
    console.error("OAuth URL generation error:", error);
    res.status(500).send("Failed to generate OAuth URL");
  }
};

export const creatorCallback = async (req, res) => {
  try {
    const { code, state: role } = req.query;
    
    if (!role) {
      return res.status(400).send("Role not specified");
    }
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;

    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        role: role === "creator" ? "creator" : "editor",
        youtubeTokens: role === "creator" ? tokens : undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const accessToken = signAccessToken({ sub: user._id });
    const refreshToken = signRefreshToken({ sub: user._id });

    user.refresh_token = { token: refreshToken, createdAt: Date.now() };
    await user.save();

    // Redirect to frontend with token
    res.redirect(`http://localhost:5173/?token=${accessToken}`);
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("Authentication failed. Please try again.");
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
      return res.status(403).json({ success: false, accessToken: "" });
    }

    const newAccessToken = signAccessToken({ sub: user._id });
    const newRefreshToken = signRefreshToken({ sub: user._id });

    user.refresh_token = { token: newRefreshToken, createdAt: Date.now() };
    await user.save();

    res
      .cookie("yteditor", newRefreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error rotating refresh token:", error);
    return res.status(500).json({ success: false, accessToken: "" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.yteditor;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await User.findByIdAndUpdate(payload.sub, { $unset: { refresh_token: '' } });
    } catch {}
  }
  res.clearCookie('yteditor').json({ message: 'Logged out' });
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-youtubeTokens -refresh_token');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user info" });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, editorEmail } = req.body;
    if (!name || !editorEmail || !req.file) {
      return res.status(400).json({ error: "name, editorEmail and video are required" });
    }

    // Create the project
    const project = await Project.create({
      name,
      creator_id: req.userId
    });

    // Find editor
    let editor = await User.findOne({ email: editorEmail });
    if (!editor) {
      return res.status(400).json({ error: "Editor not found. Please ask them to sign up first." });
    }

    // Create invite
    await Invite.findOneAndUpdate(
      { project_id: project._id, email: editorEmail },
      { project_id: project._id, email: editorEmail, status: "pending" },
      { upsert: true, new: true }
    );

    // Save the video
    // const video = await Video.create({
    //   project_id: project._id,
    //   uploaded_by: req.userId,
    //   assigned_to: editor._id,
    //   s3_key: req.file.path, // Cloudinary URL
    //   cloudinary_public_id:  req.file.filename,
    //   status: "pending"
    // });
    // Upload to Cloudinary manually
    const cloudinaryResult = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    // Save the video
    const video = await Video.create({
      project_id: project._id,
      uploaded_by: req.userId,
      assigned_to: editor._id,
      s3_key: cloudinaryResult.secure_url, // cloudinary URL
      status: "pending"
    });

    res.status(201).json({
      message: "Project, invite, and video created",
      project,
      editor: { email: editor.email },
      video
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create project with video" });
  }
};

export const getProjectVideos = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    const isCreator = project.creator_id.toString() === req.userId;
    const isAssignedEditor = await Video.exists({ 
      project_id: projectId, 
      assigned_to: req.userId 
    });
    
    if (!isCreator && !isAssignedEditor) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const records  = await Video.find({ project_id: projectId })
      .populate('uploaded_by', 'email')
      .populate('assigned_to', 'email')
      .sort({ created_at: -1 });

    const videos = await Video.find({ project_id: projectId })
      .populate('uploaded_by', 'email')
      .populate('assigned_to', 'email')
      .sort({ created_at: -1 })
      .lean();

    videos.forEach(video => {
      video.download_url = cloudinary.url(video.cloudinary_public_id, {
        resource_type: 'video',
        flags:         'attachment',
        attachment:    `${video.cloudinary_public_id}.mp4`
      });
    });
    res.json({ videos });
  } catch (error) {
    console.error("Error fetching project videos:", error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};

export const approveVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { action } = req.body;
    
    const video = await Video.findById(videoId).populate('project_id');
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }
    
    if (video.project_id.creator_id.toString() !== req.userId) {
      return res.status(403).json({ error: "Only project creator can approve videos" });
    }
    
    video.status = action === 'approve' ? 'approved' : 'changes_requested';
    await video.save();
    
    res.json({ message: `Video ${action}d successfully`, video });
  } catch (error) {
    console.error("Error updating video status:", error);
    res.status(500).json({ error: "Failed to update video status" });
  }
};

export const getCreatorProjects = async (req, res) => {
  try {
    const projects = await Project.find({ creator_id: req.userId })
      .populate('creator_id', 'email')
      .sort({ _id: -1 });
    
    res.json({ projects });
  } catch (error) {
    console.error("Error fetching creator projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const editorProjects = async (req, res) => {
  try {
    const editorEmail = req.user.email;
    const invites = await Invite.find({ email: editorEmail });
    const projectIds = invites.map(invite => invite.project_id);
    
    const projects = await Project.find({ _id: { $in: projectIds } })
      .populate("creator_id", "email");
    
    res.json({ projects });
  } catch (error) {
    console.error("Error fetching editor projects:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const editorAcceptInvite = async (req, res) => {
  try {
    const { inviteId } = req.body;
    const invite = await Invite.findById(inviteId);

    if (!invite || invite.email !== req.user.email) {
      return res.status(403).json({ error: "Invalid invite" });
    }

    if (invite.status === "accepted") {
      return res.status(400).json({ message: "Invite already accepted" });
    }

    invite.status = "accepted";
    await invite.save();

    res.status(200).json({ message: "Invite accepted" });
  } catch (err) {
    console.error("Invite accept error:", err);
    res.status(500).json({ error: "Server error while accepting invite" });
  }
};

export const uploadToYouTube = async (req, res) => {
  try {
    const { videoId, title, description, privacyStatus, madeForKids, thumbnailUrl } = req.body;
    
    if (!videoId) {
      return res.status(400).json({ error: "videoId is required" });
    }

    // Get user and verify YouTube tokens
    const user = await User.findById(req.userId);
    if (!user || !user.youtubeTokens) {
      return res.status(403).json({ 
        error: "YouTube account not connected. Please sign out and sign in as creator again to connect your YouTube account." 
      });
    }

    // Get video details
    const video = await Video.findById(videoId).populate('project_id');
    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    // Verify user is the creator of the project
    if (video.project_id.creator_id.toString() !== req.userId) {
      return res.status(403).json({ error: "Only project creator can upload videos to YouTube" });
    }

    // Verify video is approved
    if (video.status !== 'approved') {
      return res.status(400).json({ error: "Video must be approved before uploading to YouTube" });
    }

    // Check if already uploaded
    if (video.youtube_video_id) {
      return res.status(400).json({ 
        error: "Video already uploaded to YouTube",
        videoUrl: `https://www.youtube.com/watch?v=${video.youtube_video_id}`
      });
    }

    // Set up OAuth2 client with stored tokens
    oauth2Client.setCredentials(user.youtubeTokens);

    // Refresh token if expired
    if (user.youtubeTokens.expiry_date && Date.now() >= user.youtubeTokens.expiry_date) {
      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);
        user.youtubeTokens = credentials;
        await user.save();
      } catch (refreshError) {
        return res.status(401).json({ 
          error: "YouTube authentication expired. Please sign out and sign in again to reconnect your YouTube account." 
        });
      }
    }

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    // Download video from Cloudinary
    const videoResponse = await fetch(video.s3_key);
    if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.status}`);
    const videoBuffer = await videoResponse.arrayBuffer();
    const { Readable } = await import('stream');
    const videoStream = Readable.from(Buffer.from(videoBuffer));

    // Prepare video metadata
    const videoTitle = title || `${video.project_id.name} - Final Version`;
    const videoDescription = description || `Video for project: ${video.project_id.name}\n\nCreated with YT Editor Hub.`;
    const statusMetadata = {
      privacyStatus: privacyStatus || 'private', // 'public' | 'unlisted' | 'private'
      selfDeclaredMadeForKids: madeForKids === 'true' || madeForKids === true
    };

    // Upload to YouTube
    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: ['youtube', 'editor', 'collaboration'],
          categoryId: '22',
          defaultLanguage: 'en',
          defaultAudioLanguage: 'en'
        },
        status: statusMetadata
      },
      media: { body: videoStream }
    });

    const youtubeVideoId = uploadResponse.data.id;

    // Optionally set custom thumbnail if provided
    if (thumbnailUrl) {
      // Download thumbnail image
      const thumbResp = await fetch(thumbnailUrl);
      if (thumbResp.ok) {
        const thumbBuffer = await thumbResp.arrayBuffer();
        const thumbStream = Readable.from(Buffer.from(thumbBuffer));
        await youtube.thumbnails.set({
          videoId: youtubeVideoId,
          media: { body: thumbStream }
        });
      }
    }

    // Update local record
    video.youtube_video_id = youtubeVideoId;
    video.youtube_title = videoTitle;
    video.youtube_description = videoDescription;
    video.uploaded_to_youtube = true;
    video.youtube_upload_date = new Date();
    video.youtube_visibility = statusMetadata.privacyStatus;
    video.youtube_madeForKids = statusMetadata.selfDeclaredMadeForKids;
    await video.save();

    res.status(200).json({ 
      success: true,
      videoId: youtubeVideoId,
      videoUrl: `https://www.youtube.com/watch?v=${youtubeVideoId}`
    });

  } catch (err) {
    console.error("YouTube upload error:", err);
    let statusCode = 500;
    let errorMessage = "Failed to upload video to YouTube";
    if (err.message.includes('quota')) {
      statusCode = 429;
      errorMessage = "YouTube API quota exceeded.";
    }
    res.status(statusCode).json({ success: false, error: errorMessage });
  }
};


// Clodinary Sign to frontend
export const cloudinarySign = (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp },
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME
  });
}

// Signed upload to cloudinary
export const signedDataUpdate = async (req, res) => {
  try {
    const { project_id, assigned_to, public_id, url, thumbnail_url } = req.body;

    const video = new Video({
      project_id,
      uploaded_by: req.user._id,
      assigned_to,
      s3_key: url,
      cloudinary_public_id: public_id,
      youtube_thumbnail_url: thumbnail_url
    });

    await video.save();
    res.status(201).json(video);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};