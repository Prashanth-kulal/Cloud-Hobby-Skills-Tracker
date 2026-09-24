import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch 401 unauthenticated errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect if expired
      const isAuthRoute = window.location.pathname.includes('/login') || 
                          window.location.pathname.includes('/register') || 
                          window.location.pathname === '/';
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Profile Endpoints
export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadProfileImage: (formData) => api.post('/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getPublicProfile: (username) => api.get(`/users/${username}`),
};

// Skills Endpoints
export const skillsApi = {
  getSkills: () => api.get('/skills'),
  getSkill: (id) => api.get(`/skills/${id}`),
  createSkill: (data) => api.post('/skills', data),
  updateSkill: (id, data) => api.put(`/skills/${id}`, data),
  deleteSkill: (id) => api.delete(`/skills/${id}`),
};

// Goals Endpoints
export const goalsApi = {
  getGoals: (skillId) => api.get('/goals', { params: { skill_id: skillId } }),
  getGoal: (id) => api.get(`/goals/${id}`),
  createGoal: (data) => api.post('/goals', data),
  updateGoal: (id, data) => api.put(`/goals/${id}`, data),
  deleteGoal: (id) => api.delete(`/goals/${id}`),
  addMilestone: (goalId, data) => api.post(`/goals/${goalId}/milestones`, data),
  updateMilestone: (id, data) => api.put(`/milestones/${id}`, data),
  deleteMilestone: (id) => api.delete(`/milestones/${id}`),
};

// Practice Endpoints
export const practiceApi = {
  logPractice: (data) => api.post('/practice', data),
  getPracticeHistory: (params) => api.get('/practice', { params }),
  getSkillPractice: (skillId) => api.get(`/skills/${skillId}/practice`),
  getSummary: () => api.get('/practice/summary'),
  deletePractice: (id) => api.delete(`/practice/${id}`),
};

// Posts & Community Endpoints
export const communityApi = {
  getFeed: (params) => api.get('/feed', { params }),
  getPost: (id) => api.get(`/posts/${id}`),
  createPost: (data) => api.post('/posts', data),
  updatePost: (id, data) => api.put(`/posts/${id}`, data),
  deletePost: (id) => api.delete(`/posts/${id}`),
  likePost: (id) => api.post(`/posts/${id}/like`),
  unlikePost: (id) => api.delete(`/posts/${id}/like`),
  addComment: (postId, data) => api.post(`/posts/${postId}/comments`, data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// Follow Endpoints
export const followApi = {
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
  getFollowers: (userId) => api.get(`/users/${userId}/followers`),
  getFollowing: (userId) => api.get(`/users/${userId}/following`),
};

// Files Endpoints
export const filesApi = {
  uploadFile: (formData) => api.post('/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getMyFiles: () => api.get('/files'),
  deleteFile: (id) => api.delete(`/files/${id}`),
};

// Analytics Endpoints
export const analyticsApi = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getPracticeAnalytics: () => api.get('/analytics/practice'),
  getSkillsAnalytics: () => api.get('/analytics/skills'),
};

export default api;
