import React, { useEffect, useState } from 'react';
import { Video, LogOut, Plus, CheckCircle, XCircle, Upload } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { CreateProjectModal } from './CreateProjectModal';
import api from '../utils/api';

export const CreatorDashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectVideos, setProjectVideos] = useState([]);
  const [uploadingVideoId, setUploadingVideoId] = useState(null);

  useEffect(() => {
    loadCreatorProjects();
  }, []);

  const loadCreatorProjects = async () => {
    try {
      const data = await api.getCreatorProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadProjectVideos = async (projectId) => {
    try {
      const data = await api.getProjectVideos(projectId);
      setProjectVideos(data.videos);
      setSelectedProject(projectId);
    } catch (error) {
      console.error('Failed to load project videos:', error);
    }
  };

  const handleApproveVideo = async (videoId, action) => {
    try {
      await api.approveVideo(videoId, action);
      if (selectedProject) {
        loadProjectVideos(selectedProject);
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
      const title = `${projectName} - Final Version`;
      const description = `Video edited and approved for ${projectName}. Uploaded via YT Editor Hub.`;
      
      const result = await api.uploadToYouTube(video._id, title, description);
      
      alert(`Video uploaded to YouTube successfully! Video ID: ${result.videoId}`);
      
      // Refresh the video list to show updated status
      if (selectedProject) {
        loadProjectVideos(selectedProject);
      }
    } catch (error) {
      console.error('Failed to upload to YouTube:', error);
      alert(`Failed to upload video to YouTube: ${error.message}`);
    } finally {
      setUploadingVideoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-900">Creator Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-600">Welcome, {user.email}</span>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Projects Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Projects</h2>
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => loadProjectVideos(project._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedProject === project._id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">Click to view videos</p>
                  </div>
                ))}
                {projects.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No projects yet. Create your first project!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {selectedProject ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Videos</h2>
                  <div className="space-y-4">
                    {projectVideos.map((video) => (
                      <div key={video._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Video by {video.uploaded_by.email}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(video.created_at).toLocaleDateString()}
                              </p>
                              {video.youtube_video_id && (
                                <p className="text-sm text-green-600">
                                  ✓ Uploaded to YouTube (ID: {video.youtube_video_id})
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <StatusBadge status={video.status} />
                            
                            {video.status === 'pending' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveVideo(video._id, 'approve')}
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApproveVideo(video._id, 'request_changes')}
                                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Request Changes
                                </button>
                              </div>
                            )}
                            
                            {video.status === 'approved' && !video.youtube_video_id && (
                              <button
                                onClick={() => handleUploadToYouTube(video)}
                                disabled={uploadingVideoId === video._id}
                                className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
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
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                              >
                                <Video className="h-4 w-4" />
                                View on YouTube
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {projectVideos.length === 0 && (
                      <p className="text-gray-500 text-center py-4">
                        No videos in this project yet.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
                  <p className="text-gray-500">Choose a project from the sidebar to view its videos</p>
                </div>
              )}
            </div>
          </div>
        </div>
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