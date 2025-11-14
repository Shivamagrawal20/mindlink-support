import mongoose from 'mongoose';

const supportCircleSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: [true, 'Circle topic is required'],
      trim: true,
      maxlength: [100, 'Topic cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host ID is required'],
    },
    hostName: {
      type: String,
      required: true,
    },
    channelName: {
      type: String,
      required: true,
      unique: true,
    },
    joinCode: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
      min: 5, // Minimum 5 minutes
      max: 120, // Maximum 2 hours (120 minutes) for admins
      default: 30,
    },
    maxParticipants: {
      type: Number,
      default: 15,
      min: 3,
      max: 30,
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    anonymousMode: {
      type: Boolean,
      default: true,
    },
    aiModeration: {
      type: Boolean,
      default: true,
    },
    gameType: {
      type: String,
      enum: ['none', 'imposter', 'mafia', 'spyfall', 'scribble-words', 'fastest-first', 'memory-repeat', 'five-seconds', 'truth-or-lie', 'red-flag-green-flag', 'emoji-sound-guess', 'guard-the-leader', 'rapid-quiz'],
      default: 'none',
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'ended', 'cancelled'],
      default: 'scheduled',
    },
    scheduledStart: {
      type: Date,
    },
    startedAt: {
      type: Date,
    },
    endedAt: {
      type: Date,
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
        displayName: {
          type: String, // Anonymous name if anonymousMode is true
        },
      },
    ],
    flags: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
supportCircleSchema.index({ status: 1, scheduledStart: 1 });
supportCircleSchema.index({ hostId: 1 });
// channelName already has unique index from schema definition above

const SupportCircle = mongoose.model('SupportCircle', supportCircleSchema);

export default SupportCircle;

