import mongoose from 'mongoose';

const gameSessionSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportCircle',
      required: true,
      index: true,
    },
    gameType: {
      type: String,
      required: true,
      enum: ['imposter', 'mafia', 'spyfall', 'scribble-words', 'fastest-first', 'memory-repeat', 'five-seconds', 'truth-or-lie', 'red-flag-green-flag', 'emoji-sound-guess', 'guard-the-leader', 'rapid-quiz'],
    },
    status: {
      type: String,
      enum: ['waiting', 'starting', 'active', 'paused', 'ended'],
      default: 'waiting',
    },
    round: {
      type: Number,
      default: 1,
    },
    phase: {
      type: String,
      default: 'setup',
    },
    players: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: String, // e.g., 'imposter', 'crewmate', 'mafia', 'villager', etc.
        score: {
          type: Number,
          default: 0,
        },
        isAlive: {
          type: Boolean,
          default: true,
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    gameData: {
      type: mongoose.Schema.Types.Mixed, // Flexible structure for game-specific data
      default: {},
    },
    votes: {
      type: Map,
      of: String, // userId -> targetUserId
      default: {},
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
gameSessionSchema.index({ roomId: 1, status: 1 });
gameSessionSchema.index({ gameType: 1, status: 1 });

const GameSession = mongoose.model('GameSession', gameSessionSchema);

export default GameSession;

