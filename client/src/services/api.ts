import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
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
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password });

export const register = (username: string, email: string, password: string) =>
  api.post('/auth/register', { username, email, password });

// Quiz API
export const getMyQuizzes = () => api.get('/quiz/my-quizzes');

export const getQuizzes = () => api.get('/quiz');

export const createQuiz = (quizData: any) => api.post('/quiz', quizData);

export const getQuiz = (quizId: string) => api.get(`/quiz/${quizId}`);

export const startQuiz = (quizId: string) => api.post(`/quiz/${quizId}/start`);

export const submitQuiz = (quizId: string, responses: any) =>
  api.post(`/quiz/${quizId}/submit`, { responses });

export const getQuizResult = (quizId: string) =>
  api.get(`/quiz/${quizId}/result`);

export const getQuizParticipants = (quizId: string) =>
  api.get(`/quiz/${quizId}/participants`);

export const getQuizResponse = (quizId: string, userId: string) =>
  api.get(`/quiz/${quizId}/response/${userId}`);

export default api;
