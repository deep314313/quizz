const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all quizzes
router.get('/', async (req, res, next) => {
  try {
    const quizzes = await Quiz.find()
      .select('title duration totalScore createdAt')
      .populate('createdBy', 'username');
    res.json(quizzes);
  } catch (err) {
    next(err);
  }
});

// Get user's quizzes with status
router.get('/my-quizzes', async (req, res, next) => {
  try {
    const quizzes = await Quiz.find().select('title duration totalScore createdAt');
    const attempts = await QuizAttempt.find({ user: req.user.id });

    const quizzesWithStatus = quizzes.map(quiz => {
      const attempt = attempts.find(a => a.quiz.toString() === quiz._id.toString());
      return {
        ...quiz.toObject(),
        status: attempt ? attempt.status : 'not_started',
        score: attempt?.score || 0
      };
    });

    res.json(quizzesWithStatus);
  } catch (err) {
    next(err);
  }
});

// Create quiz (admin only)
router.post('/', authorize('admin'), async (req, res, next) => {
  try {
    const quiz = new Quiz({
      ...req.body,
      createdBy: req.user.id
    });
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    next(err);
  }
});

// Get quiz details
router.get('/:id', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (err) {
    next(err);
  }
});

// Start quiz attempt
router.post('/:id/start', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select('title duration totalScore questions createdAt')
      .populate('createdBy', 'username');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check if there's an existing attempt
    let attempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      status: { $in: ['not_started', 'in_progress'] }
    });

    if (!attempt) {
      // Create new attempt
      attempt = new QuizAttempt({
        user: req.user.id,
        quiz: quiz._id,
        status: 'in_progress',
        startTime: new Date()
      });
    } else if (attempt.status === 'not_started') {
      // Update existing attempt
      attempt.status = 'in_progress';
      attempt.startTime = new Date();
    }

    await attempt.save();

    // Return quiz with questions and attempt info
    const quizData = {
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        duration: quiz.duration,
        totalScore: quiz.totalScore,
        questions: quiz.questions.map(q => ({
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          marks: q.marks
        }))
      },
      attempt: {
        _id: attempt._id,
        status: attempt.status,
        startTime: attempt.startTime
      }
    };

    res.json(quizData);
  } catch (err) {
    next(err);
  }
});

// Submit quiz
router.post('/:id/submit', async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const attempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: quiz._id,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(400).json({ message: 'No active quiz attempt found' });
    }

    if (!req.body.responses || !Array.isArray(req.body.responses)) {
      return res.status(400).json({ message: 'Invalid response format' });
    }

    // Calculate score
    let totalScore = 0;
    const responses = req.body.responses.map(response => {
      if (!response.questionId || typeof response.selectedOption !== 'number') {
        throw new Error('Invalid response format');
      }

      const question = quiz.questions.id(response.questionId);
      if (!question) {
        throw new Error(`Question not found: ${response.questionId}`);
      }

      const selectedOption = Number(response.selectedOption);
      const correctOption = Number(question.correctOption);
      const isCorrect = selectedOption === correctOption;
      const marksObtained = isCorrect ? question.marks : 0;

      if (isCorrect) {
        totalScore += marksObtained;
      }

      return {
        questionId: response.questionId,
        selectedOption,
        isCorrect,
        marksObtained
      };
    });

    // Update attempt with responses and score
    attempt.responses = responses;
    attempt.score = totalScore;
    attempt.status = 'completed';
    attempt.submitTime = new Date();
    await attempt.save();

    // Calculate percentage
    const percentage = (totalScore / quiz.totalScore) * 100;

    res.json({
      message: 'Quiz submitted successfully',
      score: totalScore,
      totalScore: quiz.totalScore,
      percentage: Math.round(percentage * 10) / 10,
      responses: responses.map((response, index) => {
        const question = quiz.questions.id(response.questionId);
        return {
          question: question.questionText,
          selectedOption: response.selectedOption,
          correctOption: question.correctOption,
          isCorrect: response.isCorrect,
          marksObtained: response.marksObtained,
          totalMarks: question.marks
        };
      })
    });
  } catch (err) {
    console.error('Quiz submission error:', err);
    next(err);
  }
});

// Get quiz response
router.get('/:id/response', async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      user: req.user.id,
      quiz: req.params.id,
      status: 'completed'
    }).populate({
      path: 'quiz',
      select: 'title questions totalScore duration'
    });

    if (!attempt) {
      return res.status(404).json({ message: 'No completed attempt found' });
    }

    // Format response data
    const responseData = {
      quiz: attempt.quiz,
      userScore: attempt.score,
      responses: attempt.responses.map(response => {
        const question = attempt.quiz.questions.id(response.questionId);
        return {
          question,
          selectedOption: response.selectedOption,
          isCorrect: response.isCorrect,
          marksObtained: response.marksObtained,
          totalMarks: question.marks
        };
      })
    };

    res.json(responseData);
  } catch (err) {
    next(err);
  }
});

// Get quiz participants and scores (admin only)
router.get('/:id/participants', authorize('admin'), async (req, res, next) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('user', 'username email')
      .select('user score status submitTime responses');

    if (!attempts) {
      return res.status(404).json({ message: 'No attempts found' });
    }

    const participants = attempts.map(attempt => ({
      id: attempt._id,
      userId: attempt.user._id,
      username: attempt.user.username,
      email: attempt.user.email,
      score: attempt.score,
      status: attempt.status,
      submitTime: attempt.submitTime,
      totalQuestions: attempt.responses?.length || 0
    }));

    res.json(participants);
  } catch (err) {
    next(err);
  }
});

// Get participant's response (admin only)
router.get('/:id/response/:userId', authorize('admin'), async (req, res, next) => {
  try {
    const attempt = await QuizAttempt.findOne({
      quiz: req.params.id,
      user: req.params.userId
    }).populate('quiz user');

    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json(attempt);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
