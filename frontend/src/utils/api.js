const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const request = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken');
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
  };

  // Don't set Content-Type for FormData - browser will set it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${url}`, { 
    ...options, 
    headers 
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return await response.json();
};

const refreshToken = async () => {
  return await request('/api/refresh-token', { method: 'POST' });
};


const signIn = (role) => {
  window.location.href = `${API_BASE_URL}/api/sign-in?role=${role}`; 
}

const getUserInfo = async () => {
  return await request('/api/me');
};

// Fixed: Handle FormData properly
const createProject = async (formData) => {
  return await request('/api/projects', {
    method: 'POST',
    body: formData, // Don't stringify FormData
  });
};

const getProjectVideos = async (projectId) => {
  return await request(`/api/projects/${projectId}/videos`);
};

// Fixed: Add missing action parameter
const approveVideo = async (videoId, action) => {
  return await request(`/api/videos/${videoId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  });
};

const getEditorProjects = async () => {
  return await request('/api/editor/projects');
};

// Add missing method for loading creator projects
const getCreatorProjects = async () => {
  return await request('/api/projects');
};

const logout = async () => {
  return await request('/api/logout', { method: 'POST' });
};

const uploadToYouTube = async (videoId, title, description) => {
  return await request('/api/videos/upload-to-youtube', {
    method: 'POST',
    body: JSON.stringify({ 
      videoId, 
      title: title || 'Untitled Video',
      description: description || 'Uploaded via YT Editor Hub'
    }),
  });
};

const getVideoDetails = async (videoId) => {
  return await request(`/api/videos/${videoId}`); //////////////////
};

// Exporting all API methods as one object
const api = {
  request,
  refreshToken,
  signIn,
  getUserInfo,
  createProject,
  getProjectVideos,
  approveVideo,
  getEditorProjects,
  getCreatorProjects,
  logout,
  uploadToYouTube,
  getVideoDetails,
};

export default api;