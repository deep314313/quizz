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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const AdminDashboard = () => {
  const [quizzes, setQuizzes] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuizzes();
  }, []);

  const loadQuizzes = async () => {
    try {
      const response = await api.getQuizzes();
      setQuizzes(response.data);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    }
  };

  const handleCreateQuiz = () => {
    navigate('/admin/create-quiz');
  };

  const handleEditQuiz = (quizId) => {
    navigate(`/admin/edit-quiz/${quizId}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    try {
      await api.deleteQuiz(quizId);
      loadQuizzes();
    } catch (error) {
      console.error('Error deleting quiz:', error);
    }
  };

  const handleViewResults = (quizId) => {
    navigate(`/admin/quiz/${quizId}/results`);
  };

  return (
    <Container>
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4">Admin Dashboard</Typography>
            <Typography variant="subtitle1">Welcome, {user?.username}</Typography>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={logout} sx={{ ml: 2 }}>
              Logout
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Quiz Management</Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleCreateQuiz}
              >
                Create New Quiz
              </Button>
            </Box>
            <List>
              {quizzes.map((quiz) => (
                <React.Fragment key={quiz._id}>
                  <ListItem>
                    <ListItemText
                      primary={quiz.title}
                      secondary={`Duration: ${quiz.duration} minutes | Total Score: ${quiz.totalScore}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleViewResults(quiz._id)}
                      >
                        <AssessmentIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="primary"
                        onClick={() => handleEditQuiz(quiz._id)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        color="error"
                        onClick={() => handleDeleteQuiz(quiz._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;
