/**
 * Llama 3.1 Model Service
 * Supports both 8B and 405B models via Ollama, Replicate, or Hugging Face
 */

const LLAMA_MODELS = {
  '8b': {
    ollama: 'llama3.1:8b',
    replicate: 'meta/meta-llama-3.1-8b-instruct',
    huggingface: 'meta-llama/Meta-Llama-3.1-8B-Instruct',
  },
  '405b': {
    ollama: 'llama3.1:405b',
    replicate: 'meta/meta-llama-3.1-405b-instruct',
    huggingface: 'meta-llama/Meta-Llama-3.1-405B-Instruct',
  },
};

/**
 * Generate chat response using Llama 3.1 model
 * @param {Object} params - Generation parameters
 * @param {string} params.userMessage - User's message
 * @param {Array} params.conversationHistory - Previous conversation messages
 * @param {number} params.moodScore - User's current mood score (-2 to 2)
 * @param {string} params.moodTrend - Mood trend (improving, declining, stable)
 * @param {string} params.todayReflection - User's mood reflection
 * @param {string} params.modelSize - Model size: '8b' or '405b' (default: '8b')
 * @param {string} params.provider - Provider: 'ollama', 'replicate', or 'huggingface' (default: 'ollama')
 * @returns {Promise<{message: string, model: string}>}
 */
export async function generateLlamaResponse({
  userMessage,
  conversationHistory = [],
  moodScore = 0,
  moodTrend = 'stable',
  todayReflection = '',
  modelSize = '8b',
  provider = process.env.LLAMA_PROVIDER || 'ollama',
}) {
  try {
    // Validate model size
    if (!['8b', '405b'].includes(modelSize)) {
      throw new Error(`Invalid model size: ${modelSize}. Must be '8b' or '405b'`);
    }

    // Get model identifier based on provider
    const modelConfig = LLAMA_MODELS[modelSize];
    if (!modelConfig) {
      throw new Error(`Model configuration not found for size: ${modelSize}`);
    }

    // Build system prompt with context
    const systemPrompt = buildSystemPrompt(moodScore, moodTrend, todayReflection);

    // Build conversation messages
    const messages = buildConversationMessages(systemPrompt, conversationHistory, userMessage);

    // Generate response based on provider
    let response;
    switch (provider.toLowerCase()) {
      case 'ollama':
        response = await generateWithOllama(modelConfig.ollama, messages);
        break;
      case 'replicate':
        response = await generateWithReplicate(modelConfig.replicate, messages);
        break;
      case 'huggingface':
        response = await generateWithHuggingFace(modelConfig.huggingface, messages);
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}. Use 'ollama', 'replicate', or 'huggingface'`);
    }

    return {
      message: response.trim(),
      model: `${modelSize} (${provider})`,
    };
  } catch (error) {
    console.error('Error generating Llama response:', error);
    
    // Fallback to rule-based response if Llama fails
    return {
      message: generateFallbackResponse(userMessage, moodScore, moodTrend),
      model: 'fallback',
      error: error.message,
    };
  }
}

/**
 * Build system prompt with mood context
 */
function buildSystemPrompt(moodScore, moodTrend, todayReflection) {
  let prompt = `You are MindLink AI, a compassionate and supportive mental health companion. Your role is to:
- Listen actively and empathetically
- Provide emotional support without giving medical advice
- Help users process their feelings
- Be warm, understanding, and non-judgmental
- Keep responses concise (2-3 sentences typically)
- Use natural, conversational language`;

  // Add mood context
  if (moodScore !== 0 || moodTrend !== 'stable' || todayReflection) {
    prompt += '\n\nUser Context:';
    
    if (moodScore !== 0) {
      const moodDescription = moodScore >= 1 ? 'feeling positive' : 
                             moodScore <= -1 ? 'going through a difficult time' : 
                             'feeling neutral';
      prompt += `\n- Current mood: ${moodDescription} (score: ${moodScore})`;
    }
    
    if (moodTrend !== 'stable') {
      prompt += `\n- Mood trend: ${moodTrend}`;
    }
    
    if (todayReflection) {
      prompt += `\n- Today's reflection: ${todayReflection}`;
    }
  }

  prompt += '\n\nRemember: Be empathetic, supportive, and conversational. Avoid being overly clinical or template-like.';

  return prompt;
}

/**
 * Build conversation messages array
 */
function buildConversationMessages(systemPrompt, conversationHistory, userMessage) {
  const messages = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  // Add conversation history (last 10 messages for context)
  const recentHistory = conversationHistory.slice(-10);
  for (const msg of recentHistory) {
    if (msg.role && msg.content) {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    }
  }

  // Add current user message
  messages.push({
    role: 'user',
    content: userMessage,
  });

  return messages;
}

/**
 * Generate response using Ollama (local inference)
 */
async function generateWithOllama(model, messages) {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  
  try {
    const response = await fetch(`${ollamaUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.message?.content || data.response || '';
  } catch (error) {
    if (error.message?.includes('ECONNREFUSED') || error.message?.includes('fetch failed')) {
      throw new Error('Ollama server is not running. Please start Ollama or use a different provider.');
    }
    throw error;
  }
}

/**
 * Generate response using Replicate API
 */
async function generateWithReplicate(model, messages) {
  const replicateApiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!replicateApiToken) {
    throw new Error('REPLICATE_API_TOKEN environment variable is required');
  }

  try {
    // Convert messages to Replicate format
    const prompt = formatMessagesForReplicate(messages);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${replicateApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'latest', // Replicate will use latest version
        input: {
          prompt,
          max_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Replicate API error: ${JSON.stringify(errorData)}`);
    }

    const prediction = await response.json();
    
    // Poll for result
    let result = prediction;
    while (result.status === 'starting' || result.status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Token ${replicateApiToken}`,
        },
      });
      result = await statusResponse.json();
    }

    if (result.status === 'succeeded') {
      return Array.isArray(result.output) ? result.output.join('') : result.output;
    } else {
      throw new Error(`Replicate prediction failed: ${result.error || 'Unknown error'}`);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Generate response using Hugging Face Inference API
 */
async function generateWithHuggingFace(model, messages) {
  const hfApiToken = process.env.HUGGINGFACE_API_TOKEN;
  
  if (!hfApiToken) {
    throw new Error('HUGGINGFACE_API_TOKEN environment variable is required');
  }

  try {
    // Convert messages to Hugging Face format
    const prompt = formatMessagesForHuggingFace(messages);

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hfApiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Hugging Face API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text;
    } else if (data[0]?.text) {
      return data[0].text;
    } else {
      return JSON.stringify(data);
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Format messages for Replicate API
 */
function formatMessagesForReplicate(messages) {
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `System: ${msg.content}\n\n`;
    } else if (msg.role === 'user') {
      prompt += `User: ${msg.content}\n\n`;
    } else if (msg.role === 'assistant') {
      prompt += `Assistant: ${msg.content}\n\n`;
    }
  }
  prompt += 'Assistant:';
  return prompt;
}

/**
 * Format messages for Hugging Face API
 */
function formatMessagesForHuggingFace(messages) {
  let prompt = '';
  for (const msg of messages) {
    if (msg.role === 'system') {
      prompt += `<|system|>\n${msg.content}\n<|end|>\n`;
    } else if (msg.role === 'user') {
      prompt += `<|user|>\n${msg.content}\n<|end|>\n`;
    } else if (msg.role === 'assistant') {
      prompt += `<|assistant|>\n${msg.content}\n<|end|>\n`;
    }
  }
  prompt += '<|assistant|>\n';
  return prompt;
}

/**
 * Fallback response generator (used when Llama fails)
 */
function generateFallbackResponse(userMessage, moodScore, moodTrend) {
  const messageLower = userMessage.toLowerCase();
  
  if (moodScore <= -1) {
    return "I hear that you're going through a difficult time. I'm here to listen and support you. Would you like to talk more about what's on your mind?";
  } else if (moodScore >= 1) {
    return "I'm glad to hear you're feeling positive! What's contributing to this good feeling?";
  } else if (messageLower.includes('help') || messageLower.includes('support')) {
    return "I'm here to help. What would you like support with today?";
  } else {
    return "I'm listening. Tell me more about what's on your mind.";
  }
}

export default {
  generateLlamaResponse,
  LLAMA_MODELS,
};


