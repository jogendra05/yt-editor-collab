import React, { useState, useEffect } from 'react';
import { Users, LogOut, Video, Eye, Edit, Play, ChevronDown, ChevronUp } from 'lucide-react';
import {StatusBadge} from './StatusBadge';
import api from '../utils/api';

export const EditorDashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [expandedProject, setExpandedProject] = useState(null);
  const [projectVideos, setProjectVideos] = useState({});

  useEffect(() => {
    loadEditorProjects();
  }, []);

  const loadEditorProjects = async () => {
    try {
      const data = await api.getEditorProjects();
      const reversedProjects = data.projects.reverse();
      setProjects(reversedProjects);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Editor Dashboard</h1>
                <p className="text-gray-400 text-sm">Edit and review video projects</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-white font-medium">{user.email}</p>
                <p className="text-gray-400 text-sm">Editor</p>
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
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No Assigned Projects</h3>
            <p className="text-gray-400">Projects will appear here when creators assign them to you</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Assigned Projects</h2>
              <p className="text-gray-400">Click on any project to view and edit its videos</p>
            </div>

            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden transition-all duration-300 hover:border-blue-500/30"
              >
                {/* Project Header */}
                <div
                  onClick={() => handleProjectClick(project._id)}
                  className="p-6 cursor-pointer hover:bg-gray-700/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{project.name}</h3>
                        <p className="text-gray-400 text-sm">
                          Creator: {project.creator_id.email}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Assigned {new Date(project.created_at).toLocaleDateString()}
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
                        <Play className="h-5 w-5 text-blue-400" />
                        Videos to Edit
                      </h4>
                      
                      {projectVideos[project._id]?.length > 0 ? (
                        <div className="space-y-4">
                          {projectVideos[project._id].map((video) => (
                            <div key={video._id} className="bg-gray-800/50 border border-gray-600/50 rounded-xl p-4 hover:bg-gray-700/50 transition-all">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <Video className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-white">
                                      Video uploaded on {new Date(video.created_at).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-400">
                                      Assigned to you for editing
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Uploaded by: {video.uploaded_by?.email || 'Unknown'}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                  <StatusBadge status={video.status} />
                                  <button className="text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 p-3 rounded-xl transition-all group">
                                    <Eye className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                  </button>
                                </div>
                              </div>
                              
                              {/* Video Actions */}
                              <div className="mt-4 pt-4 border-t border-gray-600/30">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Edit className="h-4 w-4" />
                                    <span>Ready for editing</span>
                                  </div>
                                  <div className="flex gap-2">
                                    <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all">
                                      <Edit className="h-4 w-4" />
                                      Start Editing
                                    </button>
                                    <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-medium transition-all">
                                      <Video className="h-4 w-4" />
                                      Preview
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Play className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                          <p className="text-gray-400">No videos to edit yet</p>
                          <p className="text-gray-500 text-sm">Videos will appear here when uploaded by the creator</p>
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
    </div>
  );
};