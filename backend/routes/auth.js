import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { generateToken } from '../utils/generateToken.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Middleware to sanitize empty strings to undefined
const sanitizeBody = (req, res, next) => {
  Object.keys(req.body).forEach(key => {
    if (req.body[key] === '' || (typeof req.body[key] === 'string' && req.body[key].trim() === '')) {
      delete req.body[key];
    } else if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();
    }
  });
  next();
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  sanitizeBody,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('password').optional().isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array().map(e => e.msg || `${e.param}: Invalid value`).join(', '),
          errors: errors.array(),
        });
      }

      const { email, name, password, isAnonymous } = req.body;

      // Check if anonymous mode
      if (isAnonymous) {
        const user = await User.create({
          isAnonymous: true,
          role: 'user',
        });

        const token = generateToken(user._id);

        return res.status(201).json({
          success: true,
          token,
          user: user.toPublicJSON(),
        });
      }

      // Regular registration
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Check if user exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists',
        });
      }

      // Create user
      const user = await User.create({
        email,
        name,
        password,
        role: 'user',
        isAnonymous: false,
      });

      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during registration',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  sanitizeBody,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: errors.array().map(e => e.msg || `${e.param}: Invalid value`).join(', '),
          errors: errors.array(),
        });
      }

      const { email, password, isAnonymous } = req.body;

      // Anonymous login
      if (isAnonymous) {
        const user = await User.create({
          isAnonymous: true,
          role: 'user',
        });

        const token = generateToken(user._id);

        return res.status(200).json({
          success: true,
          token,
          user: user.toPublicJSON(),
        });
      }

      // Regular login
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Check for user
      const user = await User.findOne({ email }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      const token = generateToken(user._id);

      // Update last active
      user.lastActive = new Date();
      await user.save();

      res.status(200).json({
        success: true,
        token,
        user: user.toPublicJSON(),
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during login',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, preferences } = req.body;

    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

export default router;

