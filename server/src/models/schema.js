// models/schema.js
import mongoose from "mongoose";

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String },
  role: { type: String, enum: ["creator", "editor"], required: true },
  youtubeTokens: {
    access_token: { type: String },
    refresh_token: { type: String },
    scope: { type: String },
    token_type: { type: String },
    refresh_token_expires_in: { type: Number },
    expiry_date: { type: Number },
  },
  refresh_token: { 
    token: { type: String },
    created_at: { type: Date, default: Date.now },
  },
});

userSchema.index(
  { 'refreshToken.createdAt': 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  created_at: { type: Date, default: Date.now }
});

// Invite Schema
const inviteSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted"], required: true },
  created_at: { type: Date, default: Date.now }
});

// Video Schema - Updated with YouTube fields
const videoSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  s3_key: { type: String, required: true }, // Cloudinary URL or S3 key
  cloudinary_public_id: String,
  status: {
    type: String,
    enum: ["pending", "approved", "changes_requested", "editingComplete"],
    default: "pending"
  },
  // YouTube-related fields
  youtube_video_id: { type: String },               // YouTube video ID after upload
  youtube_title: { type: String },                  // Title used when uploading to YouTube
  youtube_description: { type: String },            // Description used when uploading to YouTube
  uploaded_to_youtube: { type: Boolean, default: false },
  youtube_upload_date: { type: Date },              // Date of upload
  youtube_visibility: {                              
    type: String,
    enum: ["public", "unlisted", "private"],
    default: "private"
  }, // Visibility status on YouTube
  youtube_madeForKids: { type: Boolean, default: false }, 
  youtube_thumbnail_url: { type: String },           // Custom thumbnail URL if set

  edited_s3_key: { type: String },                  // Cloudinary URL or S3 key
  edited_cloudinary_public_id: { type: String },
  edited_at: { type: Date },
  created_at: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model("User", userSchema);
const Project = mongoose.model("Project", projectSchema);
const Invite = mongoose.model("Invite", inviteSchema);
const Video = mongoose.model("Video", videoSchema);

// ES Module export
export { User, Project, Invite, Video };