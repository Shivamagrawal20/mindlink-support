import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { generateLlamaResponse } from '../utils/llamaService.js';

const router = express.Router();

// @route   POST /api/chat/message
// @desc    Send message to AI chat with mood context
// @access  Private
router.post(
  '/message',
  protect,
  [
    body('message').trim().notEmpty().withMessage('Message cannot be empty'),
    body('conversationId').optional().trim(),
    body('messageType').optional().isIn(['text', 'voice']).withMessage('Message type must be text or voice'),
    body('modelSize').optional().isIn(['8b', '405b']).withMessage('Model size must be 8b or 405b'),
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

      const { message, conversationId, messageType = 'text', modelSize = '8b' } = req.body;
      const user = await User.findById(req.user._id);
      
      // Use user ID as conversation ID if not provided
      const convId = conversationId || `user_${user._id}`;

      // Get mood context (last 7 days + today's mood)
      const last7Days = getLast7DaysMoodLogs(user.moodHistory);
      const todayMood = user.moodHistory.length > 0 
        ? user.moodHistory[user.moodHistory.length - 1]
        : null;
      const trend = calculateMoodTrend(last7Days);

      // Get conversation history from database
      const history = user.conversationHistory || [];

      // Add user message to history
      user.conversationHistory.push({ 
        role: 'user', 
        content: message,
        messageType, // Track if text or voice
        timestamp: new Date(),
      });
      
      // Keep only last 50 messages (25 exchanges) to prevent database bloat
      if (user.conversationHistory.length > 50) {
        user.conversationHistory = user.conversationHistory.slice(-50);
      }
      
      // Save user with new message
      await user.save();

      // Analyze sentiment of current message (for display only, not for response template)
      const sentiment = analyzeSentiment(message);

      // Generate AI response using Llama 3.1 model
      // Use last 10 messages (5 exchanges) for context
      const recentHistory = user.conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      let aiResponse;
      try {
        // Try Llama model first
        const llamaResult = await generateLlamaResponse({
          userMessage: message,
          conversationHistory: recentHistory,
          moodScore: todayMood?.moodScore || 0,
          moodTrend: trend.recentTrend,
          todayReflection: todayMood?.reflection || '',
          modelSize: modelSize || '8b',
        });
        
        aiResponse = {
          message: llamaResult.message,
          model: llamaResult.model,
        };
      } catch (error) {
        console.error('Llama generation error, falling back to rule-based:', error);
        // Fallback to rule-based response if Llama fails
        const fallbackResponse = generateNaturalResponse({
          userMessage: message,
          conversationHistory: recentHistory,
          moodScore: todayMood?.moodScore || 0,
          moodTrend: trend.recentTrend,
          todayReflection: todayMood?.reflection || '',
        });
        
        aiResponse = {
          message: fallbackResponse.message,
          model: 'fallback',
        };
      }

      // Add AI response to history
      user.conversationHistory.push({ 
        role: 'assistant', 
        content: aiResponse.message,
        messageType, // Same type as user message (if user used voice, AI responds in same session)
        timestamp: new Date(),
      });
      
      // Save user with AI response
      await user.save();

      res.status(200).json({
        success: true,
        data: {
          message: aiResponse.message,
          sentiment,
          conversationId: convId,
          model: aiResponse.model,
          moodContext: {
            hasContext: !!todayMood,
            trend: trend.recentTrend,
          },
        },
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

// @route   GET /api/chat/context
// @desc    Get mood context and conversation history for AI chat
// @access  Private
router.get('/context', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('moodHistory conversationHistory');
    
    const last7Days = getLast7DaysMoodLogs(user.moodHistory);
    const todayMood = user.moodHistory.length > 0 
      ? user.moodHistory[user.moodHistory.length - 1]
      : null;
    const trend = calculateMoodTrend(last7Days);

    // Get conversation history from database
    const conversationHistory = (user.conversationHistory || []).map(msg => ({
      role: msg.role,
      content: msg.content,
      messageType: msg.messageType || 'text',
      timestamp: msg.timestamp,
    }));

    // Generate natural initial greeting (not template-based) only if no previous messages
    let initialMessage = null;
    if (conversationHistory.length === 0) {
      initialMessage = generateNaturalGreeting({
        todayMood: todayMood?.moodScore || null,
        trend: trend.recentTrend,
        reflection: todayMood?.reflection || '',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        initialMessage, // null if there's conversation history
        conversationHistory, // All previous messages
        conversationId: `user_${user._id}`,
        moodContext: {
          todayMood: todayMood ? {
            score: todayMood.moodScore,
            emoji: todayMood.moodEmoji,
            reflection: todayMood.reflection,
            timestamp: todayMood.timestamp,
          } : null,
          trend: {
            direction: trend.direction,
            recentTrend: trend.recentTrend,
            average: trend.average,
          },
          last7Days,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/chat/history
// @desc    Get full conversation history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('conversationHistory');
    
    const conversationHistory = (user.conversationHistory || []).map(msg => ({
      role: msg.role,
      content: msg.content,
      messageType: msg.messageType || 'text',
      timestamp: msg.timestamp,
    }));

    res.status(200).json({
      success: true,
      data: {
        messages: conversationHistory,
        totalMessages: conversationHistory.length,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   DELETE /api/chat/history
// @desc    Clear conversation history
// @access  Private
router.delete('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Clear conversation history
    user.conversationHistory = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Conversation history cleared',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// Helper: Get last 7 days of mood logs
function getLast7DaysMoodLogs(moodHistory) {
  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return moodHistory
    .filter(entry => new Date(entry.timestamp) >= sevenDaysAgo)
    .map(entry => entry.moodScore)
    .slice(-7);
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
    };
  }

  return {
    direction: 'stable',
    average: average.toFixed(2),
    recentTrend: 'stable',
  };
}

// Helper: Analyze sentiment (for display only)
function analyzeSentiment(text) {
  const positiveWords = ["good", "great", "happy", "better", "thanks", "helped", "wonderful", "excited", "love", "amazing", "awesome", "fantastic"];
  const negativeWords = ["sad", "bad", "worse", "anxious", "stressed", "worried", "terrible", "awful", "depressed", "lonely", "tired", "exhausted"];
  
  const lowerText = text.toLowerCase();
  let score = 0.5;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) score += 0.1;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) score -= 0.1;
  });
  
  return Math.max(0, Math.min(1, score));
}

// Helper: Generate natural greeting (NO TEMPLATES)
function generateNaturalGreeting({ todayMood, trend, reflection }) {
  if (todayMood === null) {
    return "Hi there! I'm here to listen. What's on your mind today?";
  }

  // Use mood for tone, but make it conversational
  if (todayMood >= 1) {
    const variations = [
      "Hey! I see you're feeling good today — that's great! What's going well?",
      "I'm glad to see you're doing well today! What's on your mind?",
      "Nice to see you're in a positive space today. How can I support you?",
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  } else if (todayMood <= -1) {
    const variations = [
      "I noticed you've been having a tough day. I'm here — what's on your mind?",
      "I'm here for you. How are you doing right now?",
      "It sounds like today's been challenging. Want to talk about it?",
    ];
    return variations[Math.floor(Math.random() * variations.length)];
  } else {
    return "Hi there! How are you feeling today?";
  }
}

// Helper: Generate natural conversational response (NO TEMPLATES)
function generateNaturalResponse({ userMessage, conversationHistory, moodScore, moodTrend, todayReflection }) {
  const messageLower = userMessage.toLowerCase().trim();
  const messageLength = userMessage.length;
  
  // Detect conversation topic from message content
  const topics = extractTopics(userMessage);
  
  // Determine tone based on mood (not content)
  const tone = getToneFromMood(moodScore, moodTrend);
  
  // Check conversation context
  const lastUserMsg = conversationHistory.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
  const lastAIResponse = conversationHistory.filter(m => m.role === 'assistant').slice(-1)[0]?.content || '';
  const isFirstMessage = conversationHistory.filter(m => m.role === 'user').length === 1;
  
  // Generate context-aware response based on actual message content
  let response = '';
  
  // Handle specific message patterns naturally
  if (messageLower.includes('i would like to tell') || messageLower.includes('i want to tell') || messageLower.includes('let me tell')) {
    response = tone === 'warm' 
      ? "I'm all ears — go ahead and share!"
      : tone === 'grounding' 
      ? "I'm listening. Take your time."
      : "That sounds interesting — tell me about it.";
  }
  else if (messageLower.includes('encounter') || messageLower.includes('happened')) {
    response = tone === 'warm'
      ? "I'm curious — what happened?"
      : "What was that like for you?";
  }
  else if (messageLower.includes('i am great') || messageLower.includes('i\'m great') || messageLower.includes('doing great')) {
    response = tone === 'warm'
      ? "That's awesome! What's making today feel so good?"
      : "Nice! What's going well today?";
  }
  else if (messageLower.includes('happy') && !messageLower.includes('not happy') && !messageLower.includes('unhappy')) {
    response = tone === 'warm'
      ? "I can hear the energy in your words! What's bringing that happiness today?"
      : "That's wonderful! What's contributing to that feeling?";
  }
  else if (messageLower.includes('hackathon') || messageLower.includes('coding') || messageLower.includes('project')) {
    response = tone === 'warm'
      ? "Oh that's exciting! Tell me more about what you're working on."
      : "Sounds interesting — what's the project about?";
  }
  else if (messageLower.includes('screen') || messageLower.includes('computer') || messageLower.includes('laptop')) {
    response = "Working on something? What are you up to?";
  }
  else if (messageLower.startsWith('well ') || messageLower.startsWith('yeah ') || messageLower.startsWith('yes ')) {
    // Continuation of conversation
    response = isFirstMessage
      ? "Go on..."
      : tone === 'warm'
      ? "I'm following — what else?"
      : "Tell me more.";
  }
  else if (messageLength < 10) {
    // Very short messages
    response = tone === 'warm'
      ? "I'm here — what's on your mind?"
      : "How are you feeling about that?";
  }
  else if (topics.includes('question')) {
    // User is asking something
    response = tone === 'warm'
      ? "That's a good question. Let me think..."
      : "I'm here to help with that.";
  }
  else {
    // Default: respond to actual content, not mood templates
    response = generateContentBasedResponse(userMessage, tone, conversationHistory);
  }
  
  // Add natural follow-up ONLY if it makes sense (not forced)
  // Only add follow-up 30% of the time to avoid repetition
  if (Math.random() < 0.3 && !isFirstMessage) {
    const followUps = getNaturalFollowUps(userMessage, tone);
    if (followUps.length > 0) {
      response += ` ${followUps[Math.floor(Math.random() * followUps.length)]}`;
    }
  }

  return {
    message: response,
    tone,
  };
}

// Helper: Extract topics from message
function extractTopics(message) {
  const topics = [];
  const lower = message.toLowerCase();
  
  if (lower.includes('?') || lower.includes('what') || lower.includes('how') || lower.includes('why')) {
    topics.push('question');
  }
  if (lower.includes('work') || lower.includes('job') || lower.includes('project')) {
    topics.push('work');
  }
  if (lower.includes('school') || lower.includes('college') || lower.includes('exam') || lower.includes('study')) {
    topics.push('academic');
  }
  if (lower.includes('friend') || lower.includes('family') || lower.includes('relationship')) {
    topics.push('social');
  }
  if (lower.includes('tired') || lower.includes('sleep') || lower.includes('exhausted')) {
    topics.push('fatigue');
  }
  
  return topics;
}

// Helper: Get tone from mood (for tone adjustment only)
function getToneFromMood(moodScore, moodTrend) {
  if (moodScore >= 1) {
    return 'warm'; // Warm and enthusiastic
  } else if (moodScore <= -1) {
    return moodScore === -2 ? 'grounding' : 'gentle'; // Gentle/grounding for stress
  } else {
    return moodTrend === 'declining' ? 'gentle' : 'calm'; // Calm friendly or gentle
  }
}

// Helper: Generate content-based response (analyzes actual message content)
function generateContentBasedResponse(userMessage, tone, history) {
  const lower = userMessage.toLowerCase();
  
  // Check what user is actually talking about
  if (lower.includes('today') && !lower.includes('how')) {
    if (tone === 'warm') {
      return "What stood out about today?";
    } else {
      return "How did today go for you?";
    }
  }
  
  // If user mentions feelings
  if (lower.includes('feel') || lower.includes('feeling')) {
    if (tone === 'warm') {
      return "I hear that. What's behind that feeling?";
    } else {
      return "Tell me more about what that feels like.";
    }
  }
  
  // Generic but natural response based on tone
  if (tone === 'warm') {
    return "That's interesting — tell me more about that.";
  } else if (tone === 'grounding' || tone === 'gentle') {
    return "I'm here. Take your time — what's on your mind?";
  } else {
    return "I'm listening. What would you like to share?";
  }
}

// Helper: Get natural follow-ups (context-aware, not generic)
function getNaturalFollowUps(userMessage, tone) {
  const lower = userMessage.toLowerCase();
  const followUps = [];
  
  // Context-specific follow-ups
  if (lower.includes('tell') || lower.includes('share')) {
    followUps.push("I'm curious to hear more.");
  }
  if (lower.includes('happened') || lower.includes('went')) {
    followUps.push("How did that feel?");
  }
  if (lower.includes('feeling') || lower.includes('feel')) {
    followUps.push("What's contributing to that?");
  }
  
  // Tone-specific follow-ups (only if no context-specific ones)
  if (followUps.length === 0) {
    if (tone === 'warm') {
      followUps.push("What else is going on?");
    } else {
      followUps.push("How are you feeling about that?");
    }
  }
  
  return followUps;
}

export default router;
