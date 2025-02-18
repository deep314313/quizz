import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const QuizAttempt = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const response = await api.startQuiz(quizId);
      setQuiz(response.data.quiz);
      setTimeLeft(response.data.quiz.duration * 60); // Convert minutes to seconds
      
      // Initialize responses
      const initialResponses = {};
      response.data.quiz.questions.forEach((_, index) => {
        initialResponses[index] = null;
      });
      setResponses(initialResponses);
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load quiz');
      setLoading(false);
    }
  };

  const handleResponseChange = (e) => {
    setResponses({
      ...responses,
      [currentQuestion]: Number(e.target.value) - 1, // Convert to 0-based indexing immediately
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const unanswered = Object.values(responses).filter(r => r === null).length;
      if (unanswered > 0 && !openDialog) {
        setOpenDialog(true);
        return;
      }

      const formattedResponses = Object.entries(responses).map(([questionIndex, optionIndex]) => ({
        questionId: quiz.questions[questionIndex]._id,
        selectedOption: optionIndex, // Already 0-based indexing
      }));

      await api.submitQuiz(quizId, formattedResponses);
      navigate(`/quiz/${quizId}/result`);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit quiz');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <LinearProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/dashboard')}
            sx={{ mt: 2 }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Container>
    );
  }

  if (!quiz) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const question = quiz.questions[currentQuestion];
  const progress = (currentQuestion + 1) / quiz.questions.length * 100;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h5">{quiz.title}</Typography>
            <Typography variant="h6" color="primary">
              Time Left: {formatTime(timeLeft)}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mb: 3 }}
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" color="textSecondary">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {question.questionText}
            </Typography>
          </Box>

          <RadioGroup
            value={responses[currentQuestion] === null ? '' : (responses[currentQuestion] + 1).toString()}
            onChange={handleResponseChange}
          >
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={(index + 1).toString()}
                control={<Radio />}
                label={option}
              />
            ))}
          </RadioGroup>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Box>
              {currentQuestion === quiz.questions.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Submit Quiz
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Submission</DialogTitle>
        <DialogContent>
          <Typography>
            You have {Object.values(responses).filter(r => r === null).length} unanswered questions. 
            Are you sure you want to submit?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Anyway
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuizAttempt;
