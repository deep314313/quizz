import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as api from '../../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    duration: '',
    totalScore: '',
    questions: [],
  });
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctOption: '',
    marks: '',
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState('');

  const handleQuizDataChange = (e) => {
    setQuizData({
      ...quizData,
      [e.target.name]: e.target.value,
    });
  };

  const handleQuestionChange = (e) => {
    if (e.target.name === 'correctOption') {
      // Convert 1-based input to 0-based index for storage
      setCurrentQuestion({
        ...currentQuestion,
        [e.target.name]: parseInt(e.target.value) - 1
      });
    } else {
      setCurrentQuestion({
        ...currentQuestion,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({
      ...currentQuestion,
      options: newOptions,
    });
  };

  const handleAddQuestion = () => {
    // Validate question data
    if (!currentQuestion.questionText || !currentQuestion.correctOption || !currentQuestion.marks) {
      setError('Please fill all required fields');
      return;
    }

    if (currentQuestion.options.some(option => !option)) {
      setError('Please fill all options');
      return;
    }

    setQuizData({
      ...quizData,
      questions: [...quizData.questions, { ...currentQuestion }],
    });

    // Reset current question
    setCurrentQuestion({
      questionText: '',
      options: ['', '', '', ''],
      correctOption: '',
      marks: '',
    });
    setError('');
    setOpenDialog(false);
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = quizData.questions.filter((_, i) => i !== index);
    setQuizData({
      ...quizData,
      questions: newQuestions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Validate quiz data
      if (!quizData.title || !quizData.duration || !quizData.totalScore) {
        setError('Please fill all required fields');
        return;
      }

      if (quizData.questions.length === 0) {
        setError('Please add at least one question');
        return;
      }

      const response = await api.createQuiz(quizData);
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create quiz');
    }
  };

  const renderQuestionsList = () => {
    return (
      <List>
        {quizData.questions.map((question, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={`Question ${index + 1}: ${question.questionText}`}
                secondary={
                  <>
                    <Typography component="span" variant="body2">
                      Options: {question.options.join(', ')}
                      <br />
                      Correct Option: {question.correctOption + 1}
                      <br />
                      Marks: {question.marks}
                    </Typography>
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  color="error"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Create New Quiz
        </Typography>

        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Quiz Title"
                  name="title"
                  value={quizData.title}
                  onChange={handleQuizDataChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={quizData.description}
                  onChange={handleQuizDataChange}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={quizData.duration}
                  onChange={handleQuizDataChange}
                  required
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Total Score"
                  name="totalScore"
                  type="number"
                  value={quizData.totalScore}
                  onChange={handleQuizDataChange}
                  required
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 4, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setOpenDialog(true)}
              >
                Add Question
              </Button>
            </Box>

            {renderQuestionsList()}

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                sx={{ mr: 2 }}
              >
                Create Quiz
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/admin/dashboard')}
              >
                Cancel
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {/* Add Question Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Question</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Question Text"
              name="questionText"
              value={currentQuestion.questionText}
              onChange={handleQuestionChange}
              required
              sx={{ mb: 3 }}
            />

            <Typography variant="subtitle1" gutterBottom>
              Options
            </Typography>
            <Grid container spacing={2}>
              {currentQuestion.options.map((option, index) => (
                <Grid item xs={6} key={index}>
                  <TextField
                    fullWidth
                    label={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                </Grid>
              ))}
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Correct Option (1-4)"
                  name="correctOption"
                  type="number"
                  value={currentQuestion.correctOption + 1}
                  onChange={handleQuestionChange}
                  required
                  inputProps={{ min: "1", max: "4" }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Marks"
                  name="marks"
                  type="number"
                  value={currentQuestion.marks}
                  onChange={handleQuestionChange}
                  required
                  inputProps={{ min: "0" }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddQuestion} variant="contained" color="primary">
            Add Question
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CreateQuiz;
