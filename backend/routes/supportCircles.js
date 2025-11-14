import express from 'express';
import { body, validationResult } from 'express-validator';
import SupportCircle from '../models/SupportCircle.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/support-circles
// @desc    Get all active support circles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    } else {
      // Default: show active and scheduled circles
      query.status = { $in: ['active', 'scheduled'] };
    }

    // Determine limit based on user role
    let limit = 50;
    const isAdmin = req.user && (req.user.role === 'admin' || req.user.role === 'super_admin');
    
    // Main query: Get public circles (or all for admins)
    // For admins, show ALL circles including private ones
    if (isAdmin) {
      // Admins see all circles (public and private) - no isPrivate filter
      // Increase limit for admins to see more rooms
      limit = 500; // Admins can see up to 500 rooms
    } else {
      // For non-admins, only show public circles in main query
      query.isPrivate = { $ne: true }; // This excludes private circles
    }

    let circles = await SupportCircle.find(query)
      .populate('hostId', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    // For authenticated users (non-admins), also include their private circles (where they are host or participant)
    // Admins already get all circles in the main query, so skip this for them
    if (req.user && !isAdmin) {
      // Build status query for private circles (should match the main query)
      const statusFilter = status 
        ? { status: status } 
        : { status: { $in: ['active', 'scheduled'] } };
      
      // Regular users only see private circles they own or are participants in
      const userPrivateCircles = await SupportCircle.find({
        $and: [
          { isPrivate: true },
          {
            $or: [
              { hostId: req.user._id },
              { 'participants.userId': req.user._id }
            ]
          },
          statusFilter
        ]
      })
        .populate('hostId', 'name email')
        .sort({ createdAt: -1 })
        .limit(50); // Limit for regular users

      // Merge and deduplicate
      const circleIds = new Set(circles.map(c => c._id.toString()));
      const additionalCircles = userPrivateCircles.filter(c => !circleIds.has(c._id.toString()));
      circles = [...circles, ...additionalCircles].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Log for debugging (only in development)
    if (isAdmin && process.env.NODE_ENV === 'development') {
      const privateCount = circles.filter(c => c.isPrivate).length;
      const publicCount = circles.filter(c => !c.isPrivate).length;
      console.log(`Admin query: Found ${circles.length} total circles (${privateCount} private, ${publicCount} public)`);
    }

    res.status(200).json({
      success: true,
      count: circles.length,
      data: circles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/support-circles/:id
// @desc    Get single support circle
// @access  Public (but private circles only for host/participants)
router.get('/:id', async (req, res) => {
  try {
    const circle = await SupportCircle.findById(req.params.id).populate('hostId', 'name email');

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Support circle not found',
      });
    }

    // Check if circle is private and user doesn't have access
    if (circle.isPrivate) {
      // If no user authenticated, deny access
      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: 'This circle is private. Please login to access it.',
        });
      }

      // Check if user is host or participant
      const isHost = circle.hostId._id.toString() === req.user._id.toString();
      const isParticipant = circle.participants.some(
        (p) => p.userId && p.userId.toString() === req.user._id.toString()
      );

      if (!isHost && !isParticipant) {
        // Admin/super_admin can always access
        if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
          return res.status(403).json({
            success: false,
            message: 'You do not have access to this private circle',
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: circle,
      circle: circle, // Also include as 'circle' for frontend compatibility
    });
  } catch (error) {
    console.error('Error fetching support circle:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/support-circles
// @desc    Create new support circle
// @access  Private (All authenticated users, 1 per user)
router.post(
  '/',
  protect,
  [
    body('topic').trim().isLength({ min: 3, max: 100 }),
    body('duration').custom((value, { req }) => {
      const duration = parseInt(value);
      const userRole = req.user?.role || 'user';
      
      // Role-based duration limits
      if (userRole === 'admin' || userRole === 'super_admin') {
        // Admins: 5 to 120 minutes (2 hours) or custom
        if (duration < 5 || duration > 120) {
          throw new Error('Duration must be between 5 and 120 minutes for admins');
        }
      } else if (userRole === 'community_leader' || userRole === 'moderator') {
        // Leaders/Moderators: 5 to 45 minutes
        if (duration < 5 || duration > 45) {
          throw new Error('Duration must be between 5 and 45 minutes for community leaders/moderators');
        }
      } else {
        // Regular users: 20 minutes only
        if (duration !== 20) {
          throw new Error('Duration must be 20 minutes for regular users');
        }
      }
      
      return true;
    }),
    body('maxParticipants').optional().isInt({ min: 3, max: 30 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      // Check if user already has an active support circle (limit: 1 per user)
      const existingCircle = await SupportCircle.findOne({
        hostId: req.user._id,
        status: { $in: ['active', 'scheduled'] },
      });

      if (existingCircle && (req.user.role === 'user')) {
        return res.status(400).json({
          success: false,
          message: 'You can only create one active support circle at a time. Please end your existing circle first.',
        });
      }

      const {
        topic,
        description,
        duration,
        maxParticipants,
        isPrivate,
        anonymousMode,
        aiModeration,
        gameType,
      } = req.body;

      // Generate unique channel name
      const channelName = `circle-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Generate unique 6-digit join code
      // Keep trying until we find a unique code
      let joinCode;
      let attempts = 0;
      const maxAttempts = 10;
      
      do {
        joinCode = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await SupportCircle.findOne({ joinCode });
        if (!existing) break;
        attempts++;
      } while (attempts < maxAttempts);
      
      if (attempts >= maxAttempts) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate unique join code. Please try again.',
        });
      }

      const circle = await SupportCircle.create({
        topic,
        description,
        hostId: req.user._id,
        hostName: req.user.name || (anonymousMode ? 'Anonymous' : 'User'),
        channelName,
        joinCode,
        // Set default duration based on role if not provided
        duration: duration || (req.user.role === 'admin' || req.user.role === 'super_admin' ? 60 : req.user.role === 'community_leader' || req.user.role === 'moderator' ? 45 : 20),
        maxParticipants: maxParticipants || 15,
        isPrivate: isPrivate || false,
        anonymousMode: anonymousMode !== undefined ? anonymousMode : true,
        aiModeration: aiModeration !== undefined ? aiModeration : true,
        gameType: gameType || 'none',
        status: 'active',
        startedAt: new Date(),
      });

      // Ensure joinCode is populated in response
      const populatedCircle = await SupportCircle.findById(circle._id)
        .populate('hostId', 'name email');

      res.status(201).json({
        success: true,
        data: populatedCircle || circle,
        circle: populatedCircle || circle, // Also include as 'circle' for frontend compatibility
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/support-circles/:id/join
// @desc    Join support circle (allows re-joining)
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
  try {
    const circle = await SupportCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Support circle not found',
      });
    }

    if (circle.status !== 'active' && circle.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Circle is not active',
      });
    }

    // Check if private circle requires join code
    if (circle.isPrivate && req.body.joinCode && circle.joinCode !== req.body.joinCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid join code',
      });
    }

    // Check if already joined - allow re-joining
    const existingParticipant = circle.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (existingParticipant) {
      // User already joined - allow re-joining the voice room
      return res.status(200).json({
        success: true,
        message: 'Re-joined circle',
        data: circle,
      });
    }

    // Check capacity
    if (circle.currentParticipants >= circle.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Circle is full',
      });
    }

    // Add participant
    const displayName = circle.anonymousMode
      ? `User ${circle.currentParticipants + 1}`
      : req.user.name || 'User';

    circle.participants.push({
      userId: req.user._id,
      displayName,
    });
    circle.currentParticipants += 1;

    await circle.save();

    res.status(200).json({
      success: true,
      data: circle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/support-circles/join-by-code
// @desc    Join support circle by code
// @access  Private
router.post('/join-by-code', protect, [
  body('joinCode').trim().isLength({ min: 6, max: 6 }).withMessage('Join code must be 6 digits'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { joinCode } = req.body;

    // Clean and validate join code
    const cleanJoinCode = joinCode.trim();
    
    if (!cleanJoinCode || cleanJoinCode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Join code must be 6 digits',
      });
    }

    // Search for circle by join code (case-insensitive, trimmed)
    const circle = await SupportCircle.findOne({ 
      joinCode: cleanJoinCode 
    }).populate('hostId', 'name email');

    if (!circle) {
      console.error('Join code not found:', cleanJoinCode);
      // Log available codes for debugging (only in dev)
      if (process.env.NODE_ENV === 'development') {
        const allCodes = await SupportCircle.find({}, 'joinCode status').limit(10);
        console.log('Recent join codes:', allCodes.map(c => ({ code: c.joinCode, status: c.status })));
      }
      return res.status(404).json({
        success: false,
        message: 'Invalid join code. Please check the code and try again.',
      });
    }

    if (circle.status !== 'active' && circle.status !== 'scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Circle is not active',
      });
    }

    // Check if already joined - allow re-joining
    const existingParticipant = circle.participants.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );

    if (existingParticipant) {
      // User already joined - allow re-joining the voice room
      const populatedCircle = await SupportCircle.findById(circle._id)
        .populate('hostId', 'name email');
      return res.status(200).json({
        success: true,
        message: 'Re-joined circle',
        data: populatedCircle || circle,
        circle: populatedCircle || circle, // Also include as 'circle' for frontend compatibility
      });
    }

    // Check capacity
    if (circle.currentParticipants >= circle.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Circle is full',
      });
    }

    // Add participant
    const displayName = circle.anonymousMode
      ? `User ${circle.currentParticipants + 1}`
      : req.user.name || 'User';

    circle.participants.push({
      userId: req.user._id,
      displayName,
    });
    circle.currentParticipants += 1;

    await circle.save();

    // Populate before returning
    const populatedCircle = await SupportCircle.findById(circle._id)
      .populate('hostId', 'name email');

    res.status(200).json({
      success: true,
      data: populatedCircle || circle,
      circle: populatedCircle || circle, // Also include as 'circle' for frontend compatibility
    });
  } catch (error) {
    console.error('Join-by-code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/support-circles/:id/end
// @desc    End/close support circle (admin or host only)
// @access  Private
router.post('/:id/end', protect, async (req, res) => {
  try {
    const circle = await SupportCircle.findById(req.params.id).populate('hostId', 'name email');

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Support circle not found',
      });
    }

    // Check if user is admin or host
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
    const isHost = circle.hostId._id.toString() === req.user._id.toString();

    if (!isAdmin && !isHost) {
      return res.status(403).json({
        success: false,
        message: 'Only admins or the circle host can end the room',
      });
    }

    // Update circle status
    circle.status = 'ended';
    circle.endedAt = new Date();
    await circle.save();

    const populatedCircle = await SupportCircle.findById(circle._id)
      .populate('hostId', 'name email');

    res.status(200).json({
      success: true,
      message: 'Support circle ended successfully',
      data: populatedCircle || circle,
      circle: populatedCircle || circle,
    });
  } catch (error) {
    console.error('Error ending support circle:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/support-circles/:id/leave
// @desc    Leave support circle
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
  try {
    const circle = await SupportCircle.findById(req.params.id);

    if (!circle) {
      return res.status(404).json({
        success: false,
        message: 'Support circle not found',
      });
    }

    circle.participants = circle.participants.filter(
      (p) => p.userId.toString() !== req.user._id.toString()
    );
    circle.currentParticipants = Math.max(0, circle.currentParticipants - 1);

    await circle.save();

    res.status(200).json({
      success: true,
      data: circle,
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

