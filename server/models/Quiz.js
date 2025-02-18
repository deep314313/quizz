const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctOption: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: function(v) {
                return v < this.options.length;
            },
            message: 'Correct option index must be less than the number of options'
        }
    },
    marks: {
        type: Number,
        required: true,
        min: 0
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    duration: {
        type: Number,
        required: true, // in minutes
        min: 1,
        max: 180 // maximum 3 hours
    },
    totalScore: {
        type: Number,
        required: true,
        min: 1
    },
    questions: {
        type: [questionSchema],
        validate: {
            validator: function(questions) {
                return questions.length > 0;
            },
            message: 'Quiz must have at least one question'
        }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    }
}, {
    timestamps: true
});

// Virtual for calculating actual total score
quizSchema.virtual('calculatedTotalScore').get(function() {
    return this.questions.reduce((total, question) => total + question.marks, 0);
});

// Middleware to validate total score matches sum of question marks
quizSchema.pre('save', function(next) {
    const calculatedScore = this.questions.reduce((total, question) => total + question.marks, 0);
    if (this.totalScore !== calculatedScore) {
        this.totalScore = calculatedScore;
    }
    next();
});

module.exports = mongoose.model('Quiz', quizSchema);
