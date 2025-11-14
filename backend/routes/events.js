import express from 'express';
import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events (filtered by status)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, category, type } = req.query;
    const query = {};

    // Only show approved events to public, unless admin/moderator
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator' && req.user.role !== 'super_admin')) {
      query.status = 'approved';
    } else if (status) {
      query.status = status;
    }

    if (category) query.category = category;
    if (type) query.type = type;

    const events = await Event.find(query)
      .populate('hostId', 'name email')
      .sort({ date: 1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private (Community Leaders, Admins)
router.post(
  '/',
  protect,
  authorize('community_leader', 'admin', 'super_admin'),
  [
    body('title').trim().isLength({ min: 5, max: 200 }),
    body('description').trim().isLength({ min: 10 }),
    body('date').notEmpty().withMessage('Date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('type').isIn(['offline', 'online', 'hybrid']),
    body('category').isIn(['wellness', 'civic', 'learning', 'support', 'general']),
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

      const {
        title,
        description,
        date,
        time,
        location,
        type,
        category,
        maxParticipants,
        tags,
      } = req.body;

      // Validate date format (accepts YYYY-MM-DD or ISO8601)
      let eventDate;
      try {
        eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) {
          return res.status(400).json({
            success: false,
            message: 'Invalid date format',
          });
        }
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format',
        });
      }

      // Generate channel name for online events
      let channelName;
      if (type === 'online' || type === 'hybrid') {
        channelName = `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      }

      // Auto-approve for admins, pending for others
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';
      const status = isAdmin ? 'approved' : 'pending';

      // Prepare event data
      const eventData = {
        title: title.trim(),
        description: description.trim(),
        hostId: req.user._id,
        hostName: req.user.name || 'Anonymous',
        date: eventDate,
        time: time.trim(),
        location: location.trim(),
        type,
        category,
        maxParticipants: maxParticipants || 50,
        status,
      };

      // Add tags if provided
      if (tags) {
        if (typeof tags === 'string') {
          eventData.tags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
        } else if (Array.isArray(tags)) {
          eventData.tags = tags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
        }
      }

      // Add channel name if online/hybrid
      if (channelName) {
        eventData.channelName = channelName;
      }

      const event = await Event.create(eventData);

      res.status(201).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error('Event creation error:', error);
      
      // Handle mongoose validation errors
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message).join(', ');
        return res.status(400).json({
          success: false,
          message: `Validation error: ${messages}`,
          errors: Object.values(error.errors).map(err => ({
            field: err.path,
            message: err.message,
          })),
        });
      }

      // Handle duplicate key errors
      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate entry',
          error: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: 'Server error creating event',
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }
  }
);

// @route   PUT /api/events/:id/approve
// @desc    Approve event
// @access  Private (Admins, Moderators)
router.put('/:id/approve', protect, authorize('admin', 'moderator', 'super_admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = 'approved';
    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/events/:id/reject
// @desc    Reject event
// @access  Private (Admins, Moderators)
router.put('/:id/reject', protect, authorize('admin', 'moderator', 'super_admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    event.status = 'rejected';
    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// IMPORTANT: Specific routes must come before generic /:id route

// @route   GET /api/events/:id/rsvp-status
// @desc    Check if user has RSVP'd
// @access  Private
router.get('/:id/rsvp-status', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const hasRSVP = event.rsvps.some(
      (rsvp) => rsvp.userId.toString() === req.user._id.toString()
    );

    res.status(200).json({
      success: true,
      hasRSVP,
      currentParticipants: event.currentParticipants,
      maxParticipants: event.maxParticipants,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/events/:id/rsvp
// @desc    RSVP to event
// @access  Private
router.post('/:id/rsvp', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (event.status !== 'approved' && event.status !== 'live') {
      return res.status(400).json({
        success: false,
        message: 'Event is not available for RSVP',
      });
    }

    // Check if already RSVP'd
    const existingRSVP = event.rsvps.find(
      (rsvp) => rsvp.userId.toString() === req.user._id.toString()
    );

    if (existingRSVP) {
      return res.status(400).json({
        success: false,
        message: 'Already RSVP\'d to this event',
      });
    }

    // Check capacity
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    event.rsvps.push({ userId: req.user._id });
    event.currentParticipants += 1;
    await event.save();

    const updatedEvent = await Event.findById(req.params.id).populate('rsvps.userId', 'name email');

    res.status(200).json({
      success: true,
      data: updatedEvent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   DELETE /api/events/:id/rsvp
// @desc    Cancel RSVP
// @access  Private
router.delete('/:id/rsvp', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const rsvpIndex = event.rsvps.findIndex(
      (rsvp) => rsvp.userId.toString() === req.user._id.toString()
    );

    if (rsvpIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You have not RSVP\'d to this event',
      });
    }

    event.rsvps.splice(rsvpIndex, 1);
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);
    await event.save();

    res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/events/:id/rsvps
// @desc    Get RSVP list (for event creator/admin)
// @access  Private
router.get('/:id/rsvps', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('rsvps.userId', 'name email')
      .populate('hostId', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator or admin
    const isHost = event.hostId._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view RSVPs',
      });
    }

    res.status(200).json({
      success: true,
      count: event.rsvps.length,
      data: event.rsvps,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (Event creator or Admin)
router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().isLength({ min: 5, max: 200 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('date').optional(),
    body('time').optional().notEmpty(),
    body('location').optional().trim().notEmpty(),
    body('type').optional().isIn(['offline', 'online', 'hybrid']),
    body('category').optional().isIn(['wellness', 'civic', 'learning', 'support', 'general']),
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

      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Check if user is event creator or admin
      const isHost = event.hostId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

      if (!isHost && !isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this event',
        });
      }

      const {
        title,
        description,
        date,
        time,
        location,
        type,
        category,
        maxParticipants,
        tags,
      } = req.body;

      // Update fields
      if (title) event.title = title.trim();
      if (description) event.description = description.trim();
      if (date) {
        const eventDate = new Date(date);
        if (!isNaN(eventDate.getTime())) {
          event.date = eventDate;
        }
      }
      if (time) event.time = time.trim();
      if (location) event.location = location.trim();
      if (type) event.type = type;
      if (category) event.category = category;
      if (maxParticipants !== undefined) event.maxParticipants = maxParticipants;
      if (tags !== undefined) {
        if (typeof tags === 'string') {
          event.tags = tags.split(',').map(tag => tag.trim().toLowerCase()).filter(Boolean);
        } else if (Array.isArray(tags)) {
          event.tags = tags.map(tag => tag.trim().toLowerCase()).filter(Boolean);
        }
      }

      await event.save();

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (error) {
      console.error('Event update error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Private (Event creator or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator or admin
    const isHost = event.hostId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin' || req.user.role === 'super_admin';

    if (!isHost && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this event',
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event
// @access  Public
// NOTE: This route must come AFTER all specific routes (e.g., /:id/rsvp-status)
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('hostId', 'name email').populate('rsvps.userId', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: event,
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

