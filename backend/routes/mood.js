import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/mood
// @desc    Record mood check-in with AI analysis
// @access  Private
router.post(
  '/',
  protect,
  [
    body('moodScore').isInt({ min: -2, max: 2 }).withMessage('Mood score must be between -2 and 2'),
    body('moodEmoji').optional().trim(),
    body('reflection').optional().trim(),
    body('note').optional().trim(), // Legacy support
    body('mood').optional().isFloat({ min: 0, max: 1 }), // Legacy support
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

      const { moodScore, moodEmoji, reflection, note, mood } = req.body;

      const user = await User.findById(req.user._id);

      // Convert moodScore to legacy mood format (0.0 to 1.0) for backward compatibility
      const legacyMood = moodScore !== undefined ? (moodScore + 2) / 4 : (mood || 0.5);
      
      // Save mood entry
      user.moodHistory.push({
        moodScore,
        moodEmoji: moodEmoji || getEmojiForScore(moodScore),
        mood: legacyMood,
        reflection: reflection || note || undefined, // Use reflection, fallback to note
        note: reflection || note || undefined, // Legacy field
        timestamp: new Date(),
      });

      // Keep only last 100 mood entries
      if (user.moodHistory.length > 100) {
        user.moodHistory = user.moodHistory.slice(-100);
      }

      await user.save();

      // Get last 7 days of mood logs for analysis
      const last7Days = getLast7DaysMoodLogs(user.moodHistory);
      
      // Calculate trend
      const trend = calculateMoodTrend(last7Days);
      
      // Extract keywords from reflection
      const keywords = extractKeywords(reflection || note || '');
      
      // Analyze sentiment and triggers
      const moodAnalysis = analyzeMoodPattern(moodScore, last7Days, reflection || note || '', keywords);
      
      // Generate AI response with full context
      const aiResponseData = generatePersonalizedAIResponse({
        todayScore: moodScore,
        todayReflection: reflection || note || '',
        last7Days,
        trend,
        keywords,
        moodAnalysis,
      });

      // Generate suggestions based on mood + trend
      const suggestions = generateContextualSuggestions(moodScore, trend, moodAnalysis);

      res.status(200).json({
        success: true,
        data: {
          moodScore,
          moodEmoji: moodEmoji || getEmojiForScore(moodScore),
          reflection: reflection || note,
          timestamp: new Date(),
        },
        aiResponse: aiResponseData.message,
        suggestions,
        trend: {
          direction: trend.direction,
          average: trend.average,
          recentTrend: trend.recentTrend,
        },
        moodAnalysis,
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

// Helper: Get emoji for mood score
function getEmojiForScore(score) {
  const emojiMap = {
    2: '😄',
    1: '🙂',
    0: '😐',
    '-1': '☹️',
    '-2': '😫',
  };
  return emojiMap[score.toString()] || '😐';
}

// Helper: Get last 7 days of mood logs
function getLast7DaysMoodLogs(moodHistory) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return moodHistory
    .filter(entry => new Date(entry.timestamp) >= sevenDaysAgo)
    .map(entry => entry.moodScore)
    .slice(-7); // Get last 7 entries
}

// Helper: Calculate mood trend
function calculateMoodTrend(last7Days) {
  if (last7Days.length === 0) {
    return {
      direction: 'stable',
      average: 0,
      recentTrend: 'stable',
    };
  }

  const average = last7Days.reduce((sum, score) => sum + score, 0) / last7Days.length;
  
  // Calculate trend direction
  if (last7Days.length >= 3) {
    const recent3 = last7Days.slice(-3);
    const previous3 = last7Days.length >= 6 ? last7Days.slice(-6, -3) : last7Days.slice(0, -3);
    
    const recentAvg = recent3.reduce((sum, score) => sum + score, 0) / recent3.length;
    const previousAvg = previous3.length > 0 
      ? previous3.reduce((sum, score) => sum + score, 0) / previous3.length
      : recentAvg;
    
    const diff = recentAvg - previousAvg;
    
    let recentTrend = 'stable';
    if (diff > 0.3) recentTrend = 'improving';
    else if (diff < -0.3) recentTrend = 'declining';
    
    return {
      direction: recentTrend,
      average: average.toFixed(2),
      recentTrend,
      recentAverage: recentAvg.toFixed(2),
      previousAverage: previousAvg.toFixed(2),
    };
  }

  return {
    direction: 'stable',
    average: average.toFixed(2),
    recentTrend: 'stable',
  };
}

// Helper: Extract keywords from reflection text
function extractKeywords(text) {
  if (!text || text.trim() === '') return [];
  
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those'];
  
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.includes(word));
  
  // Count word frequency
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  // Return top keywords
  return Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

// Helper: Analyze mood pattern and triggers
function analyzeMoodPattern(todayScore, last7Days, reflection, keywords) {
  const analysis = {
    intensity: Math.abs(todayScore),
    isPositive: todayScore > 0,
    isNegative: todayScore < 0,
    isNeutral: todayScore === 0,
    stressCategory: null,
    emotionalTone: null,
    triggers: [],
  };

  // Detect stress categories from keywords and reflection
  const reflectionLower = (reflection || '').toLowerCase();
  
  if (reflectionLower.includes('college') || reflectionLower.includes('school') || reflectionLower.includes('exam') || reflectionLower.includes('test') || reflectionLower.includes('study')) {
    analysis.stressCategory = 'academic';
    analysis.triggers.push('Academic pressure');
  }
  
  if (reflectionLower.includes('work') || reflectionLower.includes('job') || reflectionLower.includes('deadline') || reflectionLower.includes('project')) {
    analysis.stressCategory = analysis.stressCategory || 'work';
    analysis.triggers.push('Work stress');
  }
  
  if (reflectionLower.includes('family') || reflectionLower.includes('parent') || reflectionLower.includes('sibling')) {
    analysis.triggers.push('Family');
  }
  
  if (reflectionLower.includes('friend') || reflectionLower.includes('relationship') || reflectionLower.includes('social')) {
    analysis.triggers.push('Social');
  }
  
  if (reflectionLower.includes('tired') || reflectionLower.includes('exhausted') || reflectionLower.includes('sleep')) {
    analysis.triggers.push('Fatigue');
  }

  // Determine emotional tone
  if (todayScore >= 1) {
    analysis.emotionalTone = 'positive';
  } else if (todayScore <= -1) {
    analysis.emotionalTone = 'negative';
    if (todayScore === -2) {
      analysis.emotionalTone = 'very_negative';
    }
  } else {
    analysis.emotionalTone = 'neutral';
  }

  return analysis;
}

// Helper: Generate personalized AI response with full context
function generatePersonalizedAIResponse({ todayScore, todayReflection, last7Days, trend, keywords, moodAnalysis }) {
  let message = '';
  
  // Base message on today's mood
  const moodMessages = {
    2: [
      "I'm so happy to see you're feeling great today!",
      "Wonderful to see this positive energy!",
      "I love seeing you in such a positive space!",
    ],
    1: [
      "Glad you're feeling good today!",
      "Nice to see you're in a positive mood!",
      "I'm happy you're feeling well!",
    ],
    0: [
      "Thanks for checking in. Neutral days are completely normal.",
      "I hear you. Every day doesn't need to be perfect.",
      "Appreciate you sharing. How are you feeling about today?",
    ],
    '-1': [
      "I'm sorry you're feeling low today.",
      "I hear that today's been a bit heavy for you.",
      "Thank you for sharing. Low days are part of the journey.",
    ],
    '-2': [
      "I can sense this has been really stressful for you.",
      "That sounds overwhelming. I'm here for you.",
      "Thank you for trusting me with this. Let's work through it together.",
    ],
  };

  message = moodMessages[todayScore.toString()]?.[Math.floor(Math.random() * moodMessages[todayScore.toString()].length)] || moodMessages['0'][0];

  // Add trend context
  if (last7Days.length >= 3) {
    if (trend.recentTrend === 'declining' && todayScore <= 0) {
      message += ` I noticed you've been feeling a bit lower these past few days.`;
    } else if (trend.recentTrend === 'improving' && todayScore > 0) {
      message += ` It's great to see your mood improving!`;
    } else if (trend.recentTrend === 'declining' && todayScore > 0) {
      message += ` Even though the past few days have been tough, I'm glad you're feeling better today.`;
    }
  }

  // Add reflection context
  if (todayReflection && todayReflection.trim() !== '') {
    if (moodAnalysis.stressCategory === 'academic') {
      message += ` College can be really stressful, and it's okay to feel overwhelmed.`;
    } else if (moodAnalysis.triggers.includes('Fatigue')) {
      message += ` It sounds like you're dealing with some fatigue, which can make everything feel harder.`;
    }
  }

  // Add empathetic closing
  if (todayScore <= -1) {
    message += ` You don't have to go through this alone. Would you like to talk more, or try a quick grounding exercise?`;
  } else if (todayScore === 0) {
    message += ` Want to explore something that might help boost your mood a bit?`;
  } else {
    message += ` What's something you'd like to focus on today?`;
  }

  return {
    message,
    tone: moodAnalysis.emotionalTone,
    references: {
      trend: trend.recentTrend,
      triggers: moodAnalysis.triggers,
      keywords,
    },
  };
}

// Helper: Generate contextual suggestions based on mood + trend
function generateContextualSuggestions(moodScore, trend, moodAnalysis) {
  if (moodScore <= -1) {
    // Low or Stressed - prioritize support and stress relief
    const options = [
      {
        type: 'chat',
        title: 'Talk to MindLink AI',
        description: 'Share what\'s on your mind in a judgment-free space',
        action: 'chat',
        priority: 1, // High priority for low mood
      },
      {
        type: 'support_circle',
        title: 'Join Stress Relief Room',
        description: 'Connect with others in a safe, supportive space',
        action: 'join_circle',
        priority: 2,
      },
    ];

    // Add trend-specific suggestions
    if (trend.recentTrend === 'declining') {
      options.push({
        type: 'support_circle',
        title: 'Join Calm Voice Circle',
        description: 'Gentle guided support for difficult days',
        action: 'join_circle',
        priority: 3,
      });
    }

    options.push({
      type: 'exercise',
      title: '2-Minute Breathing Exercise',
      description: 'Quick grounding technique to calm your mind',
      action: 'breathing_exercise',
      priority: 4,
    });

    return {
      type: 'stress_relief',
      options: options.sort((a, b) => a.priority - b.priority),
    };
  } else if (moodScore === 0) {
    // Neutral - suggest mindfulness and reflective activities
    return {
      type: 'neutral',
      options: [
        {
          type: 'chat',
          title: 'Chat with MindLink AI',
          description: 'Explore what\'s on your mind and discover what might help',
          action: 'chat',
        },
        {
          type: 'exercise',
          title: '2-Minute Mindfulness',
          description: 'A quick exercise to center yourself',
          action: 'mindfulness',
        },
        {
          type: 'journal',
          title: 'Gratitude Journaling',
          description: 'Reflect on what you\'re grateful for today',
          action: 'journal',
        },
      ],
    };
  } else {
    // Positive - suggest community engagement and activities
    return {
      type: 'positive',
      options: [
        {
          type: 'chat',
          title: 'Continue with MindLink AI',
          description: 'Keep the positive vibes flowing',
          action: 'chat',
        },
        {
          type: 'event',
          title: 'Discover Community Events',
          description: 'Find volunteering, games, and wellness activities',
          action: 'events',
        },
        {
          type: 'support_circle',
          title: 'Join Positive Energy Circle',
          description: 'Share your positive energy with others',
          action: 'join_circle',
        },
      ],
    };
  }
}

// @route   GET /api/mood
// @desc    Get mood history
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('moodHistory');

    res.status(200).json({
      success: true,
      data: user.moodHistory || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/mood/last-checkin
// @desc    Get last check-in date
// @access  Private
router.get('/last-checkin', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('moodHistory');
    const moodHistory = user.moodHistory || [];
    
    if (moodHistory.length === 0) {
      return res.status(200).json({
        success: true,
        hasCheckedInToday: false,
        lastCheckIn: null,
      });
    }

    // Get most recent mood entry
    const lastMoodEntry = moodHistory[moodHistory.length - 1];
    const lastCheckInDate = new Date(lastMoodEntry.timestamp);
    
    // Check if last check-in was today (same calendar day)
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const lastCheckInStart = new Date(
      lastCheckInDate.getFullYear(),
      lastCheckInDate.getMonth(),
      lastCheckInDate.getDate()
    );

    const hasCheckedInToday = lastCheckInStart.getTime() === todayStart.getTime();

    res.status(200).json({
      success: true,
      hasCheckedInToday,
      lastCheckIn: lastCheckInDate.toISOString(),
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

