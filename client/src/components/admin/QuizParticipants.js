import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Button,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const QuizParticipants = () => {
  const [participants, setParticipants] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load quiz details and participants in parallel
      const [quizResponse, participantsResponse] = await Promise.all([
        api.getQuiz(quizId),
        api.getQuizParticipants(quizId)
      ]);

      setQuiz(quizResponse.data);
      setParticipants(participantsResponse.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load participants data');
      console.error('Error loading participants:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not submitted';
    return new Date(dateString).toLocaleString();
  };

  const calculatePercentage = (score) => {
    if (!quiz || !quiz.totalScore) return 0;
    return ((score / quiz.totalScore) * 100).toFixed(1);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button variant="outlined" onClick={() => navigate('/admin/dashboard')}>
          Back to Dashboard
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {quiz && (
        <Typography variant="h4" gutterBottom>
          Participants - {quiz.title}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Username</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>Score</strong></TableCell>
              <TableCell><strong>Percentage</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Submission Time</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {participants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No participants found
                </TableCell>
              </TableRow>
            ) : (
              participants.map((participant) => (
                <TableRow key={participant.id}>
                  <TableCell>{participant.username}</TableCell>
                  <TableCell>{participant.email}</TableCell>
                  <TableCell>
                    {participant.status === 'completed' 
                      ? `${participant.score}/${quiz?.totalScore || 0}`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {participant.status === 'completed'
                      ? `${calculatePercentage(participant.score)}%`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: 
                          participant.status === 'completed' ? 'success.main' :
                          participant.status === 'in_progress' ? 'warning.main' :
                          'error.main'
                      }}
                    >
                      {participant.status.replace('_', ' ').toUpperCase()}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(participant.submitTime)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default QuizParticipants;
