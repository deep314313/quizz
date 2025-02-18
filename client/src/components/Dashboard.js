import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Box,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PlayArrow,
  Assessment,
  AccessTime,
  Score,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Dashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getMyQuizzes(); // Changed to getMyQuizzes
      setQuizzes(response.data);
    } catch (error) {
      setError('Failed to load quizzes. Please try again later.');
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async (quizId) => {
    try {
      const response = await api.startQuiz(quizId);
      if (response.data) {
        navigate(`/quiz/${quizId}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start quiz');
      console.error('Error starting quiz:', error);
    }
  };

  const handleViewResults = (quizId) => {
    navigate(`/quiz/${quizId}/result`); // Changed to /result
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />;
      case 'in_progress':
        return <Chip icon={<AccessTime />} label="In Progress" color="warning" size="small" />;
      default:
        return <Chip icon={<PlayArrow />} label="Not Started" color="primary" size="small" />;
    }
  };

  const getActionButton = (quiz) => {
    switch (quiz.status) {
      case 'completed':
        return (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => handleViewResults(quiz._id)}
            startIcon={<Assessment />}
          >
            View Results
          </Button>
        );
      case 'in_progress':
        return (
          <Button
            variant="contained"
            color="warning"
            onClick={() => handleStartQuiz(quiz._id)}
            startIcon={<PlayArrow />}
          >
            Resume
          </Button>
        );
      default:
        return (
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleStartQuiz(quiz._id)}
            startIcon={<PlayArrow />}
          >
            Start
          </Button>
        );
    }
  };

  if (loading) {
    return (
      <Container>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4">Welcome, {user?.username}!</Typography>
              <Button variant="outlined" color="primary" onClick={logout}>
                Logout
              </Button>
            </Box>
          </Grid>

          {error && (
            <Grid item xs={12}>
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Paper>
              <List>
                {quizzes.length === 0 ? (
                  <ListItem>
                    <ListItemText>
                      <Typography variant="body1">
                        No quizzes available at the moment.
                      </Typography>
                    </ListItemText>
                  </ListItem>
                ) : (
                  quizzes.map((quiz, index) => (
                    <React.Fragment key={quiz._id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {quiz.title}
                              {getStatusChip(quiz.status)}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="body2" color="textSecondary" component="div" sx={{ mt: 1 }}>
                              Duration: {quiz.duration} minutes | Total Score: {quiz.totalScore}
                            </Typography>
                          }
                        />
                        <ListItemSecondaryAction>
                          {getActionButton(quiz)}
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < quizzes.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
