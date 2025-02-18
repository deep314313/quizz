import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  LinearProgress,
  Button,
  Alert,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const QuizResult = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResult();
  }, [quizId]);

  const loadResult = async () => {
    try {
      setLoading(true);
      const response = await api.getQuizResponse(quizId);
      setResult(response.data);
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load quiz result');
      setLoading(false);
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

  if (!result) return null;

  const percentage = (result.userScore / result.quiz.totalScore) * 100;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Quiz Result
          </Typography>

          <Box sx={{ mb: 4, mt: 3 }}>
            <Typography variant="h5" gutterBottom>
              {result.quiz.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Chip
                label={`Score: ${result.userScore}/${result.quiz.totalScore}`}
                color="primary"
              />
              <Chip
                label={`Percentage: ${percentage.toFixed(1)}%`}
                color={percentage >= 60 ? 'success' : 'error'}
              />
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom>
            Question Responses
          </Typography>

          <List>
            {result.responses.map((response, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Question {index + 1}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {response.isCorrect ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Correct"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<CancelIcon />}
                            label="Incorrect"
                            color="error"
                            size="small"
                          />
                        )}
                        <Chip
                          label={`${response.marksObtained}/${response.question.marks} marks`}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography sx={{ mt: 1 }}>
                      {response.question.questionText}
                    </Typography>

                    <Box sx={{ mt: 1, pl: 2 }}>
                      {response.question.options.map((option, optionIndex) => (
                        <Typography
                          key={optionIndex}
                          color={
                            optionIndex === response.question.correctOption
                              ? 'success.main'
                              : optionIndex === response.selectedOption
                              ? 'error.main'
                              : 'text.primary'
                          }
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          {optionIndex === response.question.correctOption && (
                            <CheckCircleIcon fontSize="small" color="success" />
                          )}
                          {optionIndex === response.selectedOption &&
                            optionIndex !== response.question.correctOption && (
                              <CancelIcon fontSize="small" color="error" />
                            )}
                          {option}
                        </Typography>
                      ))}
                    </Box>
                    <Typography>
                      Your answer: Option {parseInt(response.selectedOption) + 1} - {response.question.options[response.selectedOption]}
                    </Typography>
                    <Typography color={response.isCorrect ? "success.main" : "error.main"}>
                      Correct answer: Option {parseInt(response.question.correctOption) + 1} - {response.question.options[response.question.correctOption]}
                    </Typography>
                    <Typography>
                      Marks: {response.isCorrect ? response.question.marks : 0}/{response.question.marks}
                    </Typography>
                  </Box>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </Button>
            {percentage < 60 && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate(`/quiz/${quizId}`)}
              >
                Retry Quiz
              </Button>
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default QuizResult;
