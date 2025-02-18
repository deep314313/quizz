const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register user
router.post('/register', async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: 'Please provide username, email and password'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({
                message: existingUser.email === email ? 
                    'Email already registered' : 
                    'Username already taken'
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            role: role || 'user'
        });

        await user.save();

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '60m' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

// Login user
router.post('/login', async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Please provide email and password'
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password first
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Then check role if specified
        if (role && user.role !== role.toLowerCase()) {
            return res.status(401).json({ 
                message: `Invalid credentials for ${role} login` 
            });
        }

        // Create JWT token
        const token = jwt.sign(
            { 
                id: user._id,
                role: user.role 
            },
            process.env.JWT_SECRET,
            { expiresIn: '60m' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

// Get current user
router.get('/me', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
