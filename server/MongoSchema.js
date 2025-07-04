const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/videoapp");

// Users Schema
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, enum: ['creator', 'editor'], required: true }
});

// Projects Schema
const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    creator_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

// Invites Schema
const inviteSchema = new mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted'], required: true }
});

// Videos Schema
const videoSchema = new mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    s3_key: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'changes_requested'], default: 'pending' },
    created_at: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model("User", userSchema);
const Project = mongoose.model("Project", projectSchema);
const Invite = mongoose.model("Invite", inviteSchema);
const Video = mongoose.model("Video", videoSchema);

module.exports = {
    User,
    Project,
    Invite,
    Video
};
