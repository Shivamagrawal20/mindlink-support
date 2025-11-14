import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: function() {
        return !this.isAnonymous;
      },
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: function() {
        return !this.isAnonymous && !this.googleId;
      },
      minlength: 6,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['user', 'community_leader', 'moderator', 'admin', 'super_admin'],
      default: 'user',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    avatar: {
      type: String,
    },
    preferences: {
      language: {
        type: String,
        default: 'en',
      },
      theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light',
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },
    moodHistory: [
      {
        moodScore: Number, // -2 to +2 (Great: +2, Good: +1, Okay: 0, Low: -1, Stressed: -2)
        moodEmoji: String, // Emoji representation
        mood: Number, // Legacy: 0.0 to 1.0 (for backward compatibility)
        reflection: String, // Optional reflection answer
        note: String, // Legacy: kept for backward compatibility
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    conversationHistory: [
      {
        role: {
          type: String,
          enum: ['user', 'assistant'],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        messageType: {
          type: String,
          enum: ['text', 'voice'],
          default: 'text',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get public user data (without sensitive info)
userSchema.methods.toPublicJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  if (userObject.isAnonymous) {
    delete userObject.email;
    delete userObject.name;
  }
  return userObject;
};

const User = mongoose.model('User', userSchema);

export default User;

