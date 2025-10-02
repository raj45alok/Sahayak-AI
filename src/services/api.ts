import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sahayak_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('sahayak_token');
      localStorage.removeItem('sahayak_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const authAPI = {
  login: (credentials: { email: string; password: string; userType: string }) =>
    api.post('/auth/login', credentials),
  register: (userData: any) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const teacherAPI = {
  getDashboardData: () => api.get('/teacher/dashboard'),
  generateWorksheet: (data: any) => api.post('/teacher/worksheet/generate', data),
  enhanceContent: (data: any) => api.post('/teacher/content/enhance', data),
  getPerformanceData: (classId?: string) => api.get(`/teacher/performance${classId ? `?classId=${classId}` : ''}`),
  getDoubts: () => api.get('/teacher/doubts'),
  respondToDoubt: (doubtId: string, response: string) => api.post(`/teacher/doubts/${doubtId}/respond`, { response }),
  scheduleContent: (data: any) => api.post('/teacher/schedule-content', data),
};

export const studentAPI = {
  getDashboardData: () => api.get('/student/dashboard'),
  getAssignments: () => api.get('/student/assignments'),
  submitAssignment: (assignmentId: string, data: any) => api.post(`/student/assignments/${assignmentId}/submit`, data),
  askDoubt: (data: any) => api.post('/student/doubts', data),
  getProgress: () => api.get('/student/progress'),
  getSchedule: () => api.get('/student/schedule'),
  joinClass: (classId: string) => api.post('/student/join-class', { classId }),
};