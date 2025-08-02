import React, { useEffect, useState } from 'react';
import { Video, LogOut, Plus, CheckCircle, XCircle, Upload, Play, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { VideoPreviewPage } from './VideoPreviewPage';
import { StatusBadge } from './StatusBadge';
import { CreateProjectModal } from './CreateProjectModal';
import api from '../utils/api';

export const CreatorDashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectVideos, setProjectVideos] = useState({});
  const [uploadingVideoId, setUploadingVideoId] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedVideoId, setSelectedVideoId] = useState(null);

  useEffect(() => {
    loadCreatorProjects();
  }, []);

  const loadCreatorProjects = async () => {
    try {
      const data = await api.getCreatorProjects();
      const sortedProjects = data.projects.reverse()
      setProjects(sortedProjects)
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadProjectVideos = async (projectId) => {
    try {
      const data = await api.getProjectVideos(projectId);
      setProjectVideos(prev => ({
        ...prev,
        [projectId]: data.videos
      }));
    } catch (error) {
      console.error('Failed to load project videos:', error);
    }
  };

  const handleProjectClick = async (projectId) => {
    if (expandedProject === projectId) {
      setExpandedProject(null);
    } else {
      setExpandedProject(projectId);
      if (!projectVideos[projectId]) {
        await loadProjectVideos(projectId);
      }
    }
  };

  const handleApproveVideo = async (videoId, action) => {
    try {
      await api.approveVideo(videoId, action);
      // Reload videos for the expanded project
      if (expandedProject) {
        await loadProjectVideos(expandedProject);
      }
    } catch (error) {
      console.error('Failed to approve video:', error);
      alert('Failed to update video status. Please try again.');
    }
  };

  const handleUploadToYouTube = async (video) => {
    try {
      setUploadingVideoId(video._id);
      
      const projectName = projects.find(p => p._id === video.project_id)?.name || 'Project Video';
      const title = `${projectName}`;
      const description = ` ${projectName}`;
      
      const result = await api.uploadToYouTube(video._id, title, description);
      
      alert(`Video uploaded to YouTube successfully! Video ID: ${result.videoId}`);
      
      // Refresh the video list
      if (expandedProject) {
        await loadProjectVideos(expandedProject);
      }
    } catch (error) {
      console.error('Failed to upload to YouTube:', error);
      alert(`Failed to upload video to YouTube: ${error.message}`);
    } finally {
      setUploadingVideoId(null);
    }
  };
    
  // New functions for video preview
  const handlePreviewEditedVideo = (videoId) => {
    setSelectedVideoId(videoId);
    setCurrentView('video-preview');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedVideoId(null);
  };

  // Show video preview page if selected
  if (currentView === 'video-preview') {
    return (
      <VideoPreviewPage
        videoId={selectedVideoId}
        onBack={handleBackToDashboard}
        user={user}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Video className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Creator Dashboard</h1>
                <p className="text-gray-400 text-sm">Manage your video projects</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowCreateProject(true)}
                className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-red-500/25 flex items-center gap-2 font-medium"
              >
                <Plus className="h-5 w-5" />
                New Project
              </button>
              <div className="text-right">
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-gray-400 text-sm">Creator</p>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-xl transition-all"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Video className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Projects Yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to start collaborating with editors</p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-red-500/25 flex items-center gap-2 font-medium mx-auto"
            >
              <Plus className="h-5 w-5" />
              Create First Project
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Your Projects</h2>
              <p className="text-gray-400">Click on any project to view and manage its videos</p>
            </div>

            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:border-red-500/30"
              >
                {/* Project Header */}
                <div
                  onClick={() => handleProjectClick(project._id)}
                  className="p-6 cursor-pointer hover:bg-gray-700/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Video className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <p className="text-gray-400 text-sm">
                          Created {new Date(project.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {projectVideos[project._id]?.length || 0} videos
                        </p>
                      </div>
                      {expandedProject === project._id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedProject === project._id && (
                  <div className="border-t border-gray-700/50 bg-gray-900/30">
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Play className="h-5 w-5 text-red-400" />
                        Project Videos
                      </h4>
                      
                      {projectVideos[project._id]?.length > 0 ? (
                        <div className="space-y-4">
                          {projectVideos[project._id].map((video) => (
                            <div key={video._id} className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <Play className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      Video by {video.uploaded_by.email}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                    {video.youtube_video_id && (
                                      <p className="text-sm text-green-400 flex items-center gap-1 mt-1">
                                        <CheckCircle className="h-3 w-3" />
                                        Uploaded to YouTube (ID: {video.youtube_video_id})
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <StatusBadge status={video.status} />
                                  
                                  {video.status === 'pending' && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleApproveVideo(video._id, 'approve')}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleApproveVideo(video._id, 'request_changes')}
                                        className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                                      >
                                        <XCircle className="h-4 w-4" />
                                        Request Changes
                                      </button>
                                    </div>
                                  )}
                                  {/* //**************** ************ */}
                                  {video.status === 'completed' && (
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => handlePreviewEditedVideo(video._id)}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                                      >
                                        <Eye className="h-4 w-4" />
                                        Preview Edited Video
                                      </button>
                                      <button
                                        onClick={() => handleApproveVideo(video._id, 'approve')}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                      </button>
                                    </div>
                                  )}
                                  
                                  {video.status === 'approved' && !video.youtube_video_id && (
                                    <button
                                      onClick={() => handleUploadToYouTube(video)}
                                      disabled={uploadingVideoId === video._id}
                                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 disabled:from-red-400 disabled:to-pink-400 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                                    >
                                      <Upload className="h-4 w-4" />
                                      {uploadingVideoId === video._id ? 'Uploading...' : 'Upload to YouTube'}
                                    </button>
                                  )}
                                  
                                  {video.youtube_video_id && (
                                    <a
                                      href={`https://www.youtube.com/watch?v=${video.youtube_video_id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all"
                                    >
                                      <Video className="h-4 w-4" />
                                      View on YouTube
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Play className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No videos in this project yet</p>
                          <p className="text-gray-500 text-sm">Videos will appear here once uploaded by editors</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProjectModal
          onClose={() => setShowCreateProject(false)}
          onSuccess={(project) => {
            setProjects([...projects, project]);
            setShowCreateProject(false);
          }}
        />
      )}
    </div>
  );
};