const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const request = async (url, options = {}) => {
  const fetchOptions = {
    ...options,
    credentials: 'include',
    headers: {
      ...options.headers,
    }
  };

  // Only add Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    fetchOptions.headers['Content-Type'] = 'application/json';
  }

  // console.log('→', `${API_BASE_URL}${url}`, fetchOptions);
  const res = await fetch(`${API_BASE_URL}${url}`, fetchOptions);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed with status ${res.status}`);
  }
  return res.json();
};

// When 401 from access_token happens, call this to rotate via refresh_token cookie
const refreshToken = async () => {
  // your backend endpoint to rotate should read yt_refresh cookie,
  // issue new yt_access (and possibly new yt_refresh) in its response cookies
  return await request('/api/refresh-token', { method: 'POST' });
};

const signIn = (role) => {
  // kicks off OAuth—after callback your cookies get set
  window.location.href = `${API_BASE_URL}/api/sign-in?role=${role}`;
};

const getUserInfo = async () => {
  return await request('/api/me');
};

const createProject = async (formData) => {
  return await request('/api/projects', {
    method: 'POST',
    body: formData, // leave as FormData
  });
};

const getProjectVideos = async (projectId) => {
  return await request(`/api/projects/${projectId}/videos`);
};

const approveVideo = async (videoId, action) => {
  return await request(`/api/videos/${videoId}/approve`, {
    method: 'PUT',
    body: JSON.stringify({ action }),
  });
};

const getEditorProjects = async () => {
  return await request('/api/editor/projects');
};

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
  return await request(`/api/videos/${videoId}`);
};

const updateVideoDetails = async (videoId, videoData) => {
  return await request(`/api/videos/${videoId}`, {
    method: 'PUT',
    body: JSON.stringify(videoData),
  });
};

const requestVideoChanges = async (videoId, feedback) => {
  return await request(`/api/videos/${videoId}/request-changes`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  });
};

const getCloudinarySignature = async () => {
  return await request('/api/cloudinary-signature');
};

async function uploadToCloudinary(file, signatureData) {
  const url = `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/video/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', signatureData.apiKey);
  formData.append('timestamp', signatureData.timestamp);
  formData.append('signature', signatureData.signature);
  formData.append('folder', signatureData.folder);

  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Cloudinary upload failed');
  return await res.json();
}

export default {
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
  updateVideoDetails,
  requestVideoChanges,
  getCloudinarySignature,
  uploadToCloudinary,
};
