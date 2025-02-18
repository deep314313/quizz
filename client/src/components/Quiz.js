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
  Alert,
  CircularProgress,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api';

const Quiz = () => {
  const [quiz, setQuiz] = useState(null);
  const [attempt, setAttempt] = useState(null);
  const [responses, setResponses] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    if (quiz && timeLeft > 0) {
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
  }, [quiz, timeLeft]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.startQuiz(quizId);
      const { quiz: quizData, attempt: attemptData } = response.data;
      
      setQuiz(quizData);
      setAttempt(attemptData);
      setTimeLeft(quizData.duration * 60);

      // If this is a resumed attempt, load previous responses
      if (attemptData.responses) {
        const savedResponses = {};
        attemptData.responses.forEach(response => {
          savedResponses[response.questionId] = response.selectedOption;
        });
        setResponses(savedResponses);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error loading quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const formattedResponses = Object.entries(responses).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption: Number(selectedOption), // Ensure selectedOption is a number
      }));

      await api.submitQuiz(quizId, { responses: formattedResponses });
      navigate(`/quiz/${quizId}/result`);
    } catch (error) {
      setError(error.response?.data?.message || 'Error submitting quiz');
    }
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

  if (!quiz) {
    return (
      <Container>
        <Box sx={{ mt: 4 }}>
          <Alert severity="error">
            {error || 'Quiz not found'}
          </Alert>
        </Box>
      </Container>
    );
  }

  const currentQuestionData = quiz.questions[currentQuestion];
  const progress = (currentQuestion / quiz.questions.length) * 100;
  const hasAnsweredCurrent = responses[currentQuestionData._id] !== undefined;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4">{quiz.title}</Typography>
            <Typography variant="subtitle1" color="textSecondary">
              Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
            <Box sx={{ mt: 2 }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography variant="body2" color="textSecondary" align="right" sx={{ mt: 1 }}>
                Progress: {Math.round(progress)}%
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6">
              Question {currentQuestion + 1} of {quiz.questions.length}
            </Typography>
            <Typography variant="body1" sx={{ mt: 2, mb: 2 }}>
              {currentQuestionData.questionText}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Marks: {currentQuestionData.marks}
            </Typography>

            <RadioGroup
              value={responses[currentQuestionData._id] ?? ''}
              onChange={(e) => handleOptionSelect(currentQuestionData._id, Number(e.target.value))}
            >
              {currentQuestionData.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion((prev) => prev - 1)}
            >
              Previous
            </Button>
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                disabled={!hasAnsweredCurrent}
                onClick={() => setCurrentQuestion((prev) => prev + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={Object.keys(responses).length !== quiz.questions.length}
              >
                Submit Quiz
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Quiz;
