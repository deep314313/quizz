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
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../services/api';

const AdminDashboard = () => {
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
      const response = await api.getQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      setError('Failed to load quizzes. Please try again later.');
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuiz = () => {
    navigate('/admin/quiz/create');
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/admin/quiz/${quizId}/edit`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm('Are you sure you want to delete this quiz?')) {
      try {
        await api.deleteQuiz(quizId);
        loadQuizzes(); // Reload the quiz list
      } catch (error) {
        setError('Failed to delete quiz. Please try again.');
        console.error('Error deleting quiz:', error);
      }
    }
  };

  const handleViewParticipants = (quizId) => {
    navigate(`/admin/quiz/${quizId}/participants`);
  };

  const handleViewReports = (quizId) => {
    navigate(`/admin/quiz/${quizId}/reports`);
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
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4">Admin Dashboard</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Welcome, {user?.username}!
            </Typography>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleCreateQuiz}
            >
              Create New Quiz
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Paper sx={{ mt: 4 }}>
          <List>
            {quizzes.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="No quizzes available"
                  secondary="Click 'Create New Quiz' to add your first quiz"
                />
              </ListItem>
            ) : (
              quizzes.map((quiz) => (
                <React.Fragment key={quiz._id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Typography variant="h6">
                          {quiz.title}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            Duration: {quiz.duration} minutes
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Total Score: {quiz.totalScore}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Created by: {quiz.createdBy?.username || 'Unknown'}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="participants"
                        onClick={() => handleViewParticipants(quiz._id)}
                        sx={{ mr: 1 }}
                      >
                        <PeopleIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => handleEditQuiz(quiz._id)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
