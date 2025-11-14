import express from 'express';
import { body, validationResult } from 'express-validator';
import GameSession from '../models/GameSession.js';
import SupportCircle from '../models/SupportCircle.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/games/sessions
// @desc    Create or get game session for a room
// @access  Private
router.post('/sessions', protect, async (req, res) => {
  try {
    const { roomId, gameType } = req.body;

    if (!roomId || !gameType) {
      return res.status(400).json({
        success: false,
        message: 'Room ID and game type are required',
      });
    }

    // Verify room exists and user has access
    const room = await SupportCircle.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found',
      });
    }

    // Check if user is participant or host
    const isHost = room.hostId.toString() === req.user._id.toString();
    const isParticipant = room.participants.some(
      (p) => p.userId && p.userId.toString() === req.user._id.toString()
    );

    if (!isHost && !isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You must be a participant to access game sessions',
      });
    }

    // Check if game type matches room
    if (room.gameType !== gameType) {
      return res.status(400).json({
        success: false,
        message: 'Game type does not match room configuration',
      });
    }

    // Find or create game session
    let session = await GameSession.findOne({ roomId, status: { $ne: 'ended' } });

    if (!session) {
      // Create new session
      const participants = room.participants.map((p) => ({
        userId: p.userId,
        role: null,
        score: 0,
        isAlive: true,
      }));

      session = await GameSession.create({
        roomId,
        gameType,
        status: 'waiting',
        players: participants,
        gameData: {},
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error creating game session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/games/sessions/:roomId
// @desc    Get game session for a room
// @access  Private
router.get('/sessions/:roomId', protect, async (req, res) => {
  try {
    const { roomId } = req.params;

    const session = await GameSession.findOne({ roomId, status: { $ne: 'ended' } })
      .populate('players.userId', 'name email');

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'No active game session found',
      });
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error fetching game session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/games/sessions/:sessionId/start
// @desc    Start a game session
// @access  Private (Host only)
router.post('/sessions/:sessionId/start', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { gameData } = req.body;

    const session = await GameSession.findById(sessionId).populate('roomId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found',
      });
    }

    // Verify user is host
    const room = session.roomId;
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can start the game',
      });
    }

    // Update session
    session.status = 'active';
    session.startedAt = new Date();
    session.round = 1;
    session.phase = 'setup';
    if (gameData) {
      session.gameData = { ...session.gameData, ...gameData };
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error starting game session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/games/sessions/:sessionId/assign-roles
// @desc    Assign roles to players (for games like imposter, mafia)
// @access  Private (Host only)
router.post('/sessions/:sessionId/assign-roles', protect, [
  body('roles').isObject().withMessage('Roles must be an object'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { roles } = req.body;

    const session = await GameSession.findById(sessionId).populate('roomId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found',
      });
    }

    // Verify user is host
    const room = session.roomId;
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can assign roles',
      });
    }

    // Update player roles
    session.players = session.players.map((player) => {
      const role = roles[player.userId.toString()];
      if (role) {
        player.role = role;
      }
      return player;
    });

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error assigning roles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/games/sessions/:sessionId/vote
// @desc    Submit a vote (for voting games)
// @access  Private
router.post('/sessions/:sessionId/vote', protect, [
  body('targetUserId').notEmpty().withMessage('Target user ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { targetUserId } = req.body;

    const session = await GameSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found',
      });
    }

    // Verify user is a player
    const player = session.players.find(
      (p) => p.userId.toString() === req.user._id.toString()
    );
    if (!player) {
      return res.status(403).json({
        success: false,
        message: 'You are not a player in this game',
      });
    }

    // Record vote
    if (!session.votes) {
      session.votes = new Map();
    }
    session.votes.set(req.user._id.toString(), targetUserId);

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/games/sessions/:sessionId/update-phase
// @desc    Update game phase (e.g., setup -> discussion -> voting)
// @access  Private (Host only)
router.post('/sessions/:sessionId/update-phase', protect, [
  body('phase').notEmpty().withMessage('Phase is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { sessionId } = req.params;
    const { phase, gameData } = req.body;

    const session = await GameSession.findById(sessionId).populate('roomId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found',
      });
    }

    // Verify user is host
    const room = session.roomId;
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can update game phase',
      });
    }

    session.phase = phase;
    if (gameData) {
      session.gameData = { ...session.gameData, ...gameData };
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error updating game phase:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/games/sessions/:sessionId/end
// @desc    End a game session
// @access  Private (Host only)
router.post('/sessions/:sessionId/end', protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { results } = req.body;

    const session = await GameSession.findById(sessionId).populate('roomId');
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Game session not found',
      });
    }

    // Verify user is host
    const room = session.roomId;
    if (room.hostId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the host can end the game',
      });
    }

    session.status = 'ended';
    session.endedAt = new Date();
    if (results) {
      session.results = results;
    }

    await session.save();

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error('Error ending game session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

export default router;

