import React, { useState, useEffect } from "react";
import { Users, LogOut, Video, Eye, Download } from "lucide-react"; // Add Download icon
import { StatusBadge } from "./StatusBadge"; // Adjust path based on where StatusBadge is located
import api from "../utils/api"; // Adjust path based on your file structure

export const EditorDashboard = ({ user, onLogout }) => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectVideos, setProjectVideos] = useState([]);

  useEffect(() => {
    loadEditorProjects();
  }, []);

  const loadEditorProjects = async () => {
    try {
      const data = await api.getEditorProjects();
      setProjects(data.projects);
    } catch (error) {
      console.error("Failed to load projects:", error);
    }
  };

  const loadProjectVideos = async (projectId) => {
    try {
      const data = await api.getProjectVideos(projectId);
      setProjectVideos(data.videos);
      setSelectedProject(projectId);
    } catch (error) {
      console.error("Failed to load project videos:", error);
    }
  };
  console.log("Project Videos:", projectVideos); // Debugging line to check video data
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Editor Dashboard
              </h1>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Assigned Projects
              </h2>

              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project._id}
                    onClick={() => loadProjectVideos(project._id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedProject === project._id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900">
                      {project.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Creator: {project.creator_id.email}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {selectedProject ? (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Project Videos
                  </h2>
                  <div className="space-y-4">
                    {projectVideos.map((video) => (
                      <div key={video._id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Video className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium text-gray-900">
                                Video uploaded on{" "}
                                {new Date(
                                  video.created_at
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                Assigned to you for editing
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <StatusBadge status={video.status} />
                            <button className="text-blue-600 hover:text-blue-800 p-2">
                              {video.s3_key && (
                              <a
                                href={video.s3_key}
                                className="text-green-600 hover:text-green-800 p-2"
                                title="Preview Video"
                              >
                                <Eye className="h-4 w-4" />
                              </a>
                            )}
                            </button>
                            {video.download_url && (
                              <a
                                href={video.download_url}
                                className="text-green-600 hover:text-green-800 p-2"
                                title="Download Video"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a Project
                  </h3>
                  <p className="text-gray-500">
                    Choose a project from the sidebar to view its videos
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
