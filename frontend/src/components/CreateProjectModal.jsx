import React, { useState } from 'react';
import { X, Upload, User, FileVideo, Sparkles, Star } from 'lucide-react';
import api from '../utils/api'; // Adjust the path as needed

export const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    editorEmail: '',
    video: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  const handleSubmit = async () => {
    if (!formData.name || !formData.editorEmail || !formData.video) {
      alert('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setUploadProgress('Getting upload signature...');

    try {
      // 1. Get Cloudinary signature from backend
      const signatureData = await api.getCloudinarySignature();
      
      // 2. Upload video directly to Cloudinary
      setUploadProgress('Uploading video to Cloudinary...');
      const videoUploadRes = await api.uploadToCloudinary(formData.video, signatureData);
      
      // 3. Create project with video URL
      setUploadProgress('Creating project...');
      const projectData = {
        name: formData.name,
        editorEmail: formData.editorEmail,
        video_url: videoUploadRes.secure_url
      };
      
      const result = await api.createProject(projectData);
      console.log('Project created:', result);
      
      setUploadProgress('Project created successfully! 🎉');
      
      // Small delay to show success message
      setTimeout(() => {
        onSuccess(result.project);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to create project:', error);
      alert(`Failed to create project: ${error.message}`);
      setUploadProgress('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-float-delayed opacity-40"></div>
        <div className="absolute top-1/2 left-3/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-float-slow opacity-50"></div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-700/50">
        <div className="relative p-8">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-all duration-300 p-2 hover:bg-gray-700/50 rounded-full hover:rotate-90 hover:scale-110 group"
            disabled={isSubmitting}
          >
            <X className="h-5 w-5 group-hover:drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse-glow hover:scale-110 transition-all duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <FileVideo className="h-8 w-8 text-white relative z-10" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-300 animate-spin-slow" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 animate-slideInUp">🎬 Create New Project</h2>
            <p className="text-gray-400 animate-slideInUp animation-delay-100">✨ Start your next video collaboration</p>
          </div>
          
          <div className="space-y-6 animate-slideInUp animation-delay-200">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2 hover:text-white transition-colors">
                <FileVideo className="h-4 w-4" />
                🎯 Project Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-gray-800/70 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-gray-500"
                placeholder="Enter project name"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2 hover:text-white transition-colors">
                <User className="h-4 w-4" />
                👤 Editor Email
              </label>
              <input
                type="email"
                required
                value={formData.editorEmail}
                onChange={(e) => setFormData({ ...formData, editorEmail: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-gray-800/70 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-gray-500"
                placeholder="editor@example.com"
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2 hover:text-white transition-colors">
                <Upload className="h-4 w-4" />
                🎥 Initial Video
              </label>
              <div className="relative">
                <input
                  type="file"
                  required
                  accept="video/*"
                  onChange={(e) => setFormData({ ...formData, video: e.target.files[0] })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-all duration-300 hover:bg-gray-800/70 focus:shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:border-gray-500"
                  disabled={isSubmitting}
                />
                {formData.video && (
                  <div className="mt-2 text-sm text-gray-400">
                    Selected: {formData.video.name} ({(formData.video.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploadProgress && (
              <div className="bg-gray-800/50 border border-gray-600 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-300 text-sm">{uploadProgress}</span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:scale-105 hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Star className="inline-block w-4 h-4 mr-2 animate-spin-slow" />
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};