import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['abusive_language', 'harassment', 'spam', 'inappropriate_content', 'self_harm', 'other'],
      required: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SupportCircle',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    content: {
      type: String, // The flagged message/content
    },
    description: {
      type: String, // Additional details from reporter
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    action: {
      type: String,
      enum: ['warn', 'mute', 'remove', 'ban', 'none'],
    },
    notes: {
      type: String, // Moderator/admin notes
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportedUser: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;

