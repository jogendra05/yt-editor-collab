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
    scope: {type: String},
    token_type: { type: String },
    refresh_token_expires_in: { type: Number },
    expiry_date: { type: Number },
  }
});

// Project Schema
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  creator_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
});

// Invite Schema
const inviteSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  email: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted"], required: true }
});

// Video Schema
const videoSchema = new mongoose.Schema({
  project_id: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  assigned_to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  s3_key: { type: String, required: true }, // Cloudinary URL or S3 key
  status: {
    type: String,
    enum: ["pending", "approved", "changes_requested"],
    default: "pending"
  },
  created_at: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model("User", userSchema);
const Project = mongoose.model("Project", projectSchema);
const Invite = mongoose.model("Invite", inviteSchema);
const Video = mongoose.model("Video", videoSchema);

// ES Module export
export { User, Project, Invite, Video };
