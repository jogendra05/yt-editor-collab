import { google } from "googleapis";
import { Video, Project, User, Invite } from "../models/schema.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { v2 as cloudinary } from 'cloudinary';
import { uploadToCloudinary } from "../middleware/cloudinaryUpload.js";
import { COOKIE_OPTIONS } from "../utils/cookie.js";

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
    if (!role) return res.status(400).send("Role not specified");

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const { data: { email } } = await google.oauth2({version:'v2', auth: oauth2Client}).userinfo.get();

    const user = await User.findOneAndUpdate(
      { email },
      {
        email,
        role: role === "creator" ? "creator" : "editor",
        youtubeTokens: role === "creator" ? tokens : undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const accessToken  = signAccessToken({ sub: user._id });
    const refreshToken = signRefreshToken({ sub: user._id });

    // persist refresh in DB
    user.refresh_token = { token: refreshToken, createdAt: Date.now() };
    await user.save();

    res
      .cookie("yt_access",  accessToken,  { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
      .cookie("yt_refresh", refreshToken, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .redirect(`http://localhost:5173`);
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).send("Authentication failed. Please try again.");
  }
};

export const rotateRefreshToken = async (req, res) => {
  try {
    const oldToken = req.cookies.yt_refresh;
    if (!oldToken) return res.status(401).json({ success: false, accessToken: "" });

    let payload;
    try {
      payload = verifyRefreshToken(oldToken);
    } catch {
      return res.status(403).json({ success: false, accessToken: "" });
    }

    const user = await User.findById(payload.sub);
    if (!user || user.refresh_token.token !== oldToken) {
      return res.status(403).json({ success: false, accessToken: "" });
    }

    // generate new tokens
    const newAccess  = signAccessToken({ sub: user._id });
    const newRefresh = signRefreshToken({ sub: user._id });

    // rotate in DB
    user.refresh_token = { token: newRefresh, createdAt: Date.now() };
    await user.save();

    res
      .cookie("yt_access",  newAccess,  { ...COOKIE_OPTIONS, maxAge: 15 * 60 * 1000 })
      .cookie("yt_refresh", newRefresh, { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 })
      .json({ success: true, accessToken: newAccess });
  } catch (error) {
    console.error("Error rotating refresh token:", error);
    res.status(500).json({ success: false, accessToken: "" });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.yt_refresh;
  if (token) {
    try {
      const { sub } = verifyRefreshToken(token);
      await User.findByIdAndUpdate(sub, { $unset: { refresh_token: "" } });
    } catch { /* ignore invalid token */ }
  }

  res
    .clearCookie("yt_access",  COOKIE_OPTIONS)
    .clearCookie("yt_refresh", COOKIE_OPTIONS)
    .json({ message: "Logged out" });
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
    const { name, editorEmail, video_url } = req.body;
    
    if (!name || !editorEmail || !video_url) {
      return res.status(400).json({ error: "name, editorEmail and video_url are required" });
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

    // Extract cloudinary public_id from video URL
    const matchVideo = video_url.match(/\/(youtube-editor-videos\/[^^/.]+)\.[a-zA-Z0-9]+$/);
    const cloudinary_public_id = matchVideo ? matchVideo[1] : null;

    // Save the video with Cloudinary URL
    const video = await Video.create({
      project_id: project._id,
      uploaded_by: req.userId,
      assigned_to: editor._id,
      s3_key: video_url, // Cloudinary URL from frontend
      cloudinary_public_id: cloudinary_public_id,
      status: "pending",
      // You can add other fields here if needed:
      // file_size: req.body.file_size,
      // duration: req.body.duration,
      // format: req.body.format || "MP4",
      // resolution: req.body.resolution || "1080p",
    });

    res.status(201).json({
      success: true,
      message: "Project, invite, and video created successfully",
      project,
      editor: { email: editor.email },
      video
    });
  } catch (err) {
    console.error('Error creating project:', err);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create project with video",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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
      .sort({ createdAt: -1 }); // Sort by creation time (newest first)
    
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
      .populate("creator_id", "email")
      .sort({ createdAt: -1 }); // Sort by creation time (newest first)
    
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

    // Verify video is approved or completed
    if (video.status !== 'approved' && video.status !== 'completed') {
      return res.status(400).json({ error: "Video must be approved or completed before uploading to YouTube" });
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

    // Use edited video if available, otherwise use original
    const videoUrl = video.edited_s3_key || video.s3_key;
    
    // Download video from Cloudinary/S3
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) throw new Error(`Failed to fetch video: ${videoResponse.status}`);
    const videoBuffer = await videoResponse.arrayBuffer();
    const { Readable } = await import('stream');
    const videoStream = Readable.from(Buffer.from(videoBuffer));

    // Prepare video metadata
    const videoTitle = title || `${video.project_id.name}`;
    const videoDescription = description;
    const statusMetadata = {
      privacyStatus: privacyStatus || 'public', // 'public' | 'unlisted' | 'private'
      selfDeclaredMadeForKids: madeForKids === 'true' || madeForKids === true
    };

    // Include video tags if available
    const videoTags = ['youtube', 'editor', 'collaboration'];
    if (video.tags && video.tags.length > 0) {
      videoTags.push(...video.tags);
    }

    // Upload to YouTube
    const uploadResponse = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: videoTitle,
          description: videoDescription,
          tags: videoTags,
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

    // Update local record with new schema fields
    video.youtube_video_id = youtubeVideoId;
    video.youtube_title = videoTitle;
    video.youtube_description = videoDescription;
    video.uploaded_to_youtube = true;
    video.youtube_upload_date = new Date();
    video.youtube_visibility = statusMetadata.privacyStatus;
    video.youtube_madeForKids = statusMetadata.selfDeclaredMadeForKids;
    
    // Store thumbnail URL if provided
    if (thumbnailUrl) {
      video.youtube_thumbnail_url = thumbnailUrl;
    }
    
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
export const getCloudinarySignature = (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: 'youtube-editor-videos' }, // you can add more params if needed
    process.env.CLOUDINARY_API_SECRET
  );
  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: 'youtube-editor-videos'
  });
};

// GET /api/videos/:videoId - Load video details
export const loadVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;

    // Validate videoId
    if (!videoId) {
      return res.status(400).json({ 
        success: false, 
        message: "Video ID is required" 
      });
    }

    // Find video by ID and populate related fields
    const video = await Video.findById(videoId)
      .populate('project_id', 'title description creator_id')
      .populate('uploaded_by', 'email name')
      .populate('assigned_to', 'email name')
      .populate({
        path: 'project_id',
        populate: {
          path: 'creator_id',
          select: 'email name'
        }
      });

    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }
    // Transform the video data to match frontend expectations
    const videoResponse = {
      _id: video._id,
      title: video.youtube_title || video.project_id?.title || 'Untitled Video',
      description: video.youtube_description || video.project_id?.description || '',
      status: video.status,
      
      // URLs for video and thumbnail
      edited_video_url: video.edited_s3_key || video.s3_key, // Use edited version if available, fallback to original
      thumbnail_url: video.youtube_thumbnail_url,
      
      // File information
      file_size: video.file_size,
      duration: video.duration,
      format: video.format || 'MP4',
      resolution: video.resolution || '1080p',
      
      // Cloudinary info
      cloudinary_public_id: video.edited_cloudinary_public_id || video.cloudinary_public_id,
      
      // User information
      uploaded_by: video.uploaded_by,
      assigned_editor: video.assigned_to,
      
      // YouTube information
      youtube_video_id: video.youtube_video_id,
      uploaded_to_youtube: video.uploaded_to_youtube,
      youtube_visibility: video.youtube_visibility,
      youtube_madeForKids: video.youtube_madeForKids,
      
      // Timestamps
      created_at: video.created_at,
      edited_at: video.edited_at,
      youtube_upload_date: video.youtube_upload_date,
      
      // Project information
      project: {
        _id: video.project_id?._id,
        title: video.project_id?.title,
        creator: video.project_id?.creator_id
      },
      
      // Tags (if you want to add tags functionality)
      tags: video.tags || []
    };
    res.status(200).json({
      success: true,
      video: videoResponse
    });

  } catch (error) {
    console.error('Error loading video details:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to load video details",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// PUT /api/videos/:videoId - Update video details
export const updateVideoDetails = async (req, res) => {
  try {
    const { videoId } = req.params;
    const {
      title,
      description,
      tags,
      youtube_visibility,
      youtube_madeForKids,
      edited_video_url,
      thumbnail_url,
      status,
    } = req.body;

    // Fetch existing video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ success: false, message: 'Video not found' });
    }

    // --- Delete previous edited video on Cloudinary if uploading a new one ---
    if (
      edited_video_url &&
      edited_video_url !== video.edited_s3_key &&
      video.edited_cloudinary_public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          video.edited_cloudinary_public_id,
          { resource_type: 'video' }
        );
      } catch (err) {
        console.warn('Could not delete previous edited video:', err.message);
      }
    }

    // --- Delete previous thumbnail on Cloudinary if uploading a new one ---
    if (
      thumbnail_url &&
      thumbnail_url !== video.youtube_thumbnail_url &&
      video.edited_thumbnail_public_id
    ) {
      try {
        await cloudinary.uploader.destroy(
          video.edited_thumbnail_public_id,
          { resource_type: 'image' }
        );
      } catch (err) {
        console.warn('Could not delete previous thumbnail:', err.message);
      }
    }

    // --- Prepare update data ---
    const updateData = {};
    if (title !== undefined) updateData.youtube_title = title;
    if (description !== undefined) updateData.youtube_description = description;
    if (tags !== undefined) {
      updateData.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map(tag => tag.trim());
    }
    if (youtube_visibility !== undefined)
      updateData.youtube_visibility = youtube_visibility;
    if (youtube_madeForKids !== undefined)
      updateData.youtube_madeForKids = youtube_madeForKids;
    if (status !== undefined) updateData.status = status; 

    // --- Handle new edited video URL & public ID (including folder) ---
    if (edited_video_url !== undefined) {
      updateData.edited_s3_key = edited_video_url;
      // derive public_id from URL (assumes URL contains '/youtube-editor-videos/<public_id>.<ext>')
      const matchVideo = edited_video_url.match(/\/(youtube-editor-videos\/[^^/.]+)\.[a-zA-Z0-9]+$/);
      if (matchVideo) {
        updateData.edited_cloudinary_public_id = matchVideo[1];
      }
    }

    // --- Handle new thumbnail URL & public ID (including folder) ---
    if (thumbnail_url !== undefined) {
      updateData.youtube_thumbnail_url = thumbnail_url;
      const matchThumb = thumbnail_url.match(/\/(youtube-editor-videos\/[^^/.]+)\.[a-zA-Z0-9]+$/);
      if (matchThumb) {
        updateData.edited_thumbnail_public_id = matchThumb[1];
      }
    }

    // --- Execute update ---
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('uploaded_by', 'email name')
      .populate('assigned_to', 'email name');

    return res.status(200).json({
      success: true,
      message: 'Video details updated successfully',
      video: updatedVideo,
    });
  } catch (error) {
    console.error('Error updating video details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update video details',
      error:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// POST /api/videos/:videoId/request-changes - Request changes to video
export const requestVideoChanges = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { changes_requested, feedback } = req.body;

    const video = await Video.findById(videoId)
      .populate('project_id', 'creator_id')
      .populate('assigned_to', 'email');

    if (!video) {
      return res.status(404).json({ 
        success: false, 
        message: "Video not found" 
      });
    }

    // Update video status
    video.status = 'changes_requested';
    video.feedback = feedback;
    video.changes_requested_at = new Date();
    
    await video.save();

    // You can add notification logic here similar to your signedDataUpdate function
    // notifyOnChangesRequested({
    //   editorEmail: video.assigned_to.email,
    //   creatorEmail: video.project_id.creator_id.email,
    //   feedback: feedback,
    //   videoUrl: video.s3_key
    // });

    res.status(200).json({
      success: true,
      message: "Changes requested successfully",
      video: video
    });

  } catch (error) {
    console.error('Error requesting video changes:', error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to request changes",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};


// // Signed upload to cloudinary
// export const signedDataUpdate = async (req, res) => {
//   try {
//     const { project_id, assigned_to, public_id, url, thumbnail_url } = req.body;

//     const video = new Video({
//       project_id,
//       uploaded_by: req.user._id,
//       assigned_to,
//       s3_key: url,
//       cloudinary_public_id: public_id,
//       youtube_thumbnail_url: thumbnail_url,
//       status: "Completed"
//     });

//     const project = await Project.findById(project_id).populate("creator_id", "email");

//     if (!project) {
//       console.error(`Project not found: ${project_id}`);
//       return res.status(201).json(video);
//     }

//     await video.save();
//     // notifyOnUpload({
//     //   creatorEmail: project.creator_id.email,
//     //   editorEmail:  req.user.email,
//     //   videoUrl:     "google.com",
//     //   by:           'editor'
//     // }, res);

//     res.status(201).json(video);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };
