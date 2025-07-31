import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Edit, Download, Share2, Eye, Calendar, User } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import api from '../utils/api';

export const VideoPreviewPage = ({ videoId, onBack, user }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changesFeedback, setChangesFeedback] = useState('');
  const [formData, setFormData] = useState({
  title: '',
  description: '',
  tags: ''
  });

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title || '',
        description: video.description || '',
        tags: video.tags?.join(', ') || ''
      });
    }
  }, [video]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Save Changes function
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      
      const updateData = {
        title: formData.title,
        description: formData.description,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await api.updateVideoDetails(videoId, updateData);
      
      // Show success message or toast
      alert('Video details updated successfully!');
      
      // Optionally reload video details
      await loadVideoDetails();
      
    } catch (error) {
      console.error('Failed to update video:', error);
      alert('Failed to update video details: ' + error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // Request Changes function
  const handleRequestChanges = async () => {
    if (!changesFeedback.trim()) {
      alert('Please provide feedback for the changes requested.');
      return;
    }

    try {
      setIsRequestingChanges(true);
      
      await api.requestVideoChanges(videoId, changesFeedback);
      
      // Show success message
      alert('Changes requested successfully!');
      
      // Close modal and reset
      setShowChangeModal(false);
      setChangesFeedback('');
      
      // Reload video details to show updated status
      await loadVideoDetails();
      
    } catch (error) {
      console.error('Failed to request changes:', error);
      alert('Failed to request changes: ' + error.message);
    } finally {
      setIsRequestingChanges(false);
    }
  };

  useEffect(() => {
    loadVideoDetails();
  }, [videoId]);

  const loadVideoDetails = async () => {
    try {
      setLoading(true);
      const data = await api.getVideoDetails(videoId);
      setVideo(data.video);
    } catch (error) {
      console.error('Failed to load video details:', error);
      setError('Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Play className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Video</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={onBack}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-xl transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-600"></div>
              <div>
                <h1 className="text-2xl font-bold text-white">Video Preview</h1>
                <p className="text-gray-400 text-sm">Review edited video content</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={video.status} />
              <div className="text-right">
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-gray-400 text-sm">Creator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player - Left Side (2/3 width) */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
              {/* Video Container */}
              <div className="aspect-video bg-black relative group">
                {video.edited_video_url ? (
                  <video
                    className="w-full h-full object-contain"
                    controls
                    poster={video.thumbnail_url}
                  >
                    <source src={video.edited_video_url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-lg">No edited video available</p>
                      <p className="text-gray-500 text-sm">Video is still being processed</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Controls */}
              <div className="p-6 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Uploaded {new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="w-px h-4 bg-gray-600"></div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <User className="h-4 w-4" />
                      <span>Edited by {video.assigned_editor?.email || 'Editor'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all">
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                    <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all">
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                    <button 
                      onClick={() => setShowChangeModal(true)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                      disabled={isRequestingChanges}
                    >
                      <Edit className="h-4 w-4" />
                      {isRequestingChanges ? 'Requesting...' : 'Request Changes'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Details - Right Side (1/3 width) */}
          <div className="space-y-6">
            {/* Video Information */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                Video Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter video title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Enter video description..."
                  />
                </div>

                <div>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                    placeholder="Enter tags separated by commas..."
                  />
                </div>

                <button 
                  onClick={handleSaveChanges}
                  disabled={isUpdating}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Thumbnail */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Thumbnail</h3>
              
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-600/50">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">No thumbnail</p>
                    </div>
                  </div>
                )}
              </div>
              
              <button className="w-full mt-4 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white py-2 rounded-lg text-sm font-medium transition-all">
                Upload New Thumbnail
              </button>
            </div>

            {/* Video Statistics */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Statistics</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">File Size</span>
                  <span className="text-white text-sm font-medium">
                    {video.file_size ? `${(video.file_size / 1024 / 1024).toFixed(1)} MB` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Duration</span>
                  <span className="text-white text-sm font-medium">
                    {video.duration || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Format</span>
                  <span className="text-white text-sm font-medium">
                    {video.format || 'MP4'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Quality</span>
                  <span className="text-white text-sm font-medium">
                    {video.resolution || '1080p'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {showChangeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Request Changes</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Feedback for Editor
              </label>
              <textarea
                value={changesFeedback}
                onChange={(e) => setChangesFeedback(e.target.value)}
                rows={4}
                className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none resize-none"
                placeholder="Please describe the changes you'd like to see..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChangeModal(false);
                  setChangesFeedback('');
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestChanges}
                disabled={isRequestingChanges || !changesFeedback.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingChanges ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};