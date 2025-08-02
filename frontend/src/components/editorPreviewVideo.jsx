import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowLeft,
  UploadCloud,
  Calendar,
  User,
  Eye,
  Check,
  AlertCircle,
  Film,
  Image,
  Save,
  Tag
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import api from '../utils/api';
// import { uploadToCloudinary } from '../utils/cloudinaryUpload'; // import the helper

const EditorUploadPage = ({ videoId, onBack, user }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [dragActive, setDragActive] = useState({
    video: false,
    thumb: false
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadVideo() {
      try {
        setLoading(true);
        const { video } = await api.getVideoDetails(videoId);
        setVideo(video);
        setFormData({
          title: video.title || '',
          description: video.description || '',
          tags: (video.tags || []).join(', ')
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load video details');
      } finally {
        setLoading(false);
      }
    }
    loadVideo();
  }, [videoId]);

  const handleInputChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleDragOver = (e, type) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e, type) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragActive((prev) => ({ ...prev, [type]: false }));
    const file = e.dataTransfer.files[0];
    if (file) {
      type === 'video' ? setVideoFile(file) : setThumbFile(file);
    }
  };

  const handleVideoChange = (e) => setVideoFile(e.target.files[0]);
  const handleThumbChange = (e) => setThumbFile(e.target.files[0]);

  const handleSaveDetails = async () => {
    try {
      setIsUpdating(true);
      setSaveSuccess(false);

      let editedVideoUrl = video?.edited_video_url;
      let thumbnailUrl = video?.thumbnail_url;

      // 1) Get Cloudinary signature from backend
      const signatureData = await api.getCloudinarySignature();

      // 2) Upload edited video if selected
      if (videoFile) {
        const videoUploadRes = await api.uploadToCloudinary(videoFile, signatureData);
        editedVideoUrl = videoUploadRes.secure_url;
        setVideoFile(null);
      }

      // 3) Upload thumbnail if selected
      if (thumbFile) {
        // For images, change endpoint to /image/upload
        const imageUrl = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`;
        const formData = new FormData();
        formData.append('file', thumbFile);
        formData.append('api_key', signatureData.apiKey);
        formData.append('timestamp', signatureData.timestamp);
        formData.append('signature', signatureData.signature);
        formData.append('folder', signatureData.folder);
        const res = await fetch(imageUrl, { method: 'POST', body: formData });
        if (!res.ok) throw new Error('Cloudinary thumbnail upload failed');
        const imgUploadRes = await res.json();
        thumbnailUrl = imgUploadRes.secure_url;
        setThumbFile(null);
      }

      // 4) Update video details in your DB
      if (thumbnailUrl || editedVideoUrl) {
        await api.updateVideoDetails(videoId, {
          title: formData.title,
          description: formData.description,
          tags: formData.tags.split(',').map((t) => t.trim()).filter((t) => t),
          edited_video_url: editedVideoUrl,
          thumbnail_url: thumbnailUrl,
          status: "completed"  // Add status here
        });
      }
      

      // 5) Refresh video state
      const { video: updated } = await api.getVideoDetails(videoId);
      setVideo(updated);

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error saving details: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Loading video details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="text-center bg-slate-800/80 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 text-lg mb-6">{error}</p>
          <button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
        <div className="flex justify-between items-center px-8 py-6">
          <button
            onClick={onBack}
            className="flex items-center text-slate-400 hover:text-white transition-colors duration-200 group"
          >
            <ArrowLeft
              className="mr-2 group-hover:-translate-x-1 transition-transform duration-200"
              size={20}
            />
            <span className="font-medium">Back to Dashboard</span>
          </button>
          <div className="flex items-center gap-6">
            <StatusBadge status={video.status} />
            <div className="flex items-center gap-3 bg-slate-800/50 rounded-lg px-4 py-2 border border-slate-700/50">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-slate-200 font-medium">{user.email}</p>
                <p className="text-slate-400 text-sm">Editor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload &amp; Edit</h1>
          <p className="text-slate-400">Upload your edited video and customize the details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Upload + Previews */}
          <div className="lg:col-span-2 space-y-8">

            {/* Preview existing edited video */}
            {/* {video.edited_video_url && (
              <section className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8">
                <h2 className="text-xl font-semibold text-white mb-4">Current Edited Video</h2>
                <video
                  src={video.edited_video_url}
                  controls
                  className="w-full rounded-lg border border-slate-600/50"
                />
              </section>
            )} */}

            {/* Video Upload */}
            <section className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Film className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload Edited Video</h2>
                  <p className="text-slate-400 text-sm">Drag & drop or click to select your final file</p>
                </div>
              </div>

              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                  dragActive.video
                    ? 'border-blue-400 bg-blue-400/10'
                    : videoFile
                    ? 'border-green-400 bg-green-400/10'
                    : 'border-slate-600 hover:border-slate-500'
                }`}
                onDragOver={(e) => handleDragOver(e, 'video')}
                onDragLeave={(e) => handleDragLeave(e, 'video')}
                onDrop={(e) => handleDrop(e, 'video')}
              >
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                      videoFile ? 'bg-green-500/20' : 'bg-slate-700'
                    }`}
                  >
                    {videoFile ? (
                      <Check className="h-8 w-8 text-green-400" />
                    ) : (
                      <UploadCloud className="h-8 w-8 text-slate-400" />
                    )}
                  </div>

                  {videoFile ? (
                    <div>
                      <p className="text-green-400 font-medium">{videoFile.name}</p>
                      <p className="text-slate-400 text-sm">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-white font-medium">Drag & drop your video here</p>
                      <p className="text-slate-400 text-sm">or click to browse files</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Thumbnail Upload */}
            <section className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 hover:bg-slate-800/50 transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Upload Thumbnail</h2>
                  <p className="text-slate-400 text-sm">Pick an eye-catching image for your video</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">
                    Current Thumbnail
                  </label>
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-600/50 relative group">
                    {thumbFile ? (
                      <img
                        src={URL.createObjectURL(thumbFile)}
                        alt="New thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    ) : video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full">
                        <Eye className="h-8 w-8 text-slate-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Eye className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* New */}
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-3">
                    Upload New
                  </label>
                  <div
                    className={`aspect-video border-2 border-dashed rounded-lg relative transition-all duration-300 ${
                      dragActive.thumb
                        ? 'border-purple-400 bg-purple-400/10'
                        : thumbFile
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-slate-600 hover:border-slate-500'
                    }`}
                    onDragOver={(e) => handleDragOver(e, 'thumb')}
                    onDragLeave={(e) => handleDragLeave(e, 'thumb')}
                    onDrop={(e) => handleDrop(e, 'thumb')}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {thumbFile ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Check className="h-8 w-8 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 text-sm font-medium">{thumbFile.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Image className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-slate-400 text-sm">Drop image here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Details Form */}
          <div className="lg:col-span-1">
            <section className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-8 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Save className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Video Details</h2>
                  <p className="text-slate-400 text-sm">Edit video information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Enter video title..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your video..."
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="gaming, tutorial, review"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    />
                  </div>
                  <p className="text-slate-500 text-xs mt-1">Separate tags with commas</p>
                </div>

                <button
                  onClick={handleSaveDetails}
                  disabled={isUpdating}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    saveSuccess
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
                  }`}
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Saving...
                    </>
                  ) : saveSuccess ? (
                    <>
                      <Check className="h-4 w-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Stats */}
        <footer className="mt-12 bg-slate-800/30 backdrop-blur-lg border border-slate-700/50 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3 text-slate-300">
              <Calendar className="h-5 w-5 text-blue-400" />
              <span className="font-medium">Uploaded on</span>
              <span className="text-slate-400">
                {new Date(video.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <User className="h-5 w-5 text-purple-400" />
              <span className="font-medium">Assigned Editor:</span>
              <span className="text-slate-400">
                {video.assigned_editor?.email || 'Not assigned'}
              </span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

EditorUploadPage.propTypes = {
  videoId: PropTypes.string.isRequired,
  onBack: PropTypes.func.isRequired,
  user: PropTypes.shape({
    email: PropTypes.string.isRequired
  }).isRequired
};

export default EditorUploadPage;
