import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
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
    date: {
      type: Date,
      required: [true, 'Event date is required'],
    },
    time: {
      type: String,
      required: [true, 'Event time is required'],
    },
    location: {
      type: String,
      required: [true, 'Event location is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['offline', 'online', 'hybrid'],
      required: true,
      default: 'offline',
    },
    category: {
      type: String,
      enum: ['wellness', 'civic', 'learning', 'support', 'general'],
      required: true,
      default: 'general',
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'live', 'finished', 'cancelled'],
      default: 'pending',
    },
    maxParticipants: {
      type: Number,
      default: 50,
      min: 1,
      max: 500,
    },
    currentParticipants: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    channelName: {
      type: String,
      // Auto-generated for online events
    },
    rsvps: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rsvpAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    banner: {
      type: String, // URL to banner image
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ hostId: 1 });
eventSchema.index({ category: 1, status: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event;

