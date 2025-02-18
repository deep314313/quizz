import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const login = (email, password, role) =>
  api.post('/auth/login', { email, password, role: role.toLowerCase() });

export const register = (username, email, password, role) =>
  api.post('/auth/register', { username, email, password, role });

// Quiz API - Admin
export const getQuizzes = () => api.get('/quiz');

export const getQuiz = (quizId) => api.get(`/quiz/${quizId}`);

export const createQuiz = (quizData) => api.post('/quiz', quizData);

export const updateQuiz = (quizId, quizData) =>
  api.put(`/quiz/${quizId}`, quizData);

export const deleteQuiz = (quizId) => api.delete(`/quiz/${quizId}`);

export const getQuizParticipants = (quizId) =>
  api.get(`/quiz/${quizId}/participants`);

export const getParticipantResponse = (quizId, userId) =>
  api.get(`/quiz/${quizId}/response/${userId}`);

// Quiz API - User
export const getMyQuizzes = () => api.get('/quiz/my-quizzes');

export const startQuiz = (quizId) => api.post(`/quiz/${quizId}/start`);

export const submitQuiz = (quizId, responses) =>
  api.post(`/quiz/${quizId}/submit`, { responses });

export const getQuizResponse = (quizId) =>
  api.get(`/quiz/${quizId}/response`);

// Reports API
export const getQuizReports = (quizId) =>
  api.get(`/quiz/${quizId}/reports`);

export const getOverallReports = () =>
  api.get('/reports/overall');

export default api;
