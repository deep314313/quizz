import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import CreateQuiz from './components/admin/CreateQuiz';
import QuizAttempt from './components/quiz/QuizAttempt';
import QuizResult from './components/quiz/QuizResult';
import QuizParticipants from './components/admin/QuizParticipants'; // Import QuizParticipants component

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} />;
  }
  
  return children;
};

const App = () => {
  const { user } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirect root to appropriate dashboard */}
          <Route
            path="/"
            element={
              <Navigate
                to={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
              />
            }
          />

          {/* User Routes */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute requiredRole="user">
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <PrivateRoute requiredRole="user">
                <QuizAttempt />
              </PrivateRoute>
            }
          />
          <Route
            path="/quiz/:quizId/result"
            element={
              <PrivateRoute requiredRole="user">
                <QuizResult />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute requiredRole="admin">
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/quiz/create"
            element={
              <PrivateRoute requiredRole="admin">
                <CreateQuiz />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin/quiz/:quizId/participants"
            element={
              <PrivateRoute requiredRole="admin">
                <QuizParticipants />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
