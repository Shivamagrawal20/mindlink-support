// API service for connecting frontend to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
  const user = localStorage.getItem('mindlink_user');
  if (user) {
    try {
      const userData = JSON.parse(user);
      return userData.token || null;
    } catch {
      return null;
    }
  }
  return null;
};

// Helper function to make API requests
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (error: any) {
    // Handle network errors (connection refused, etc.)
    if (error.message?.includes('Failed to fetch') || error.message?.includes('ERR_CONNECTION_REFUSED')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running on port 5001.');
    }
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    // If response is not JSON, use text instead
    const text = await response.text();
    throw new Error(text || 'API request failed');
  }

  if (!response.ok) {
    // Handle 401 Unauthorized - clear invalid token and redirect to login
    if (response.status === 401) {
      // Clear invalid token from localStorage
      localStorage.removeItem('mindlink_user');
      // Throw a specific error that components can catch
      const error = new Error('Not authorized to access this route');
      (error as any).status = 401;
      (error as any).isAuthError = true;
      throw error;
    }
    
    // Extract error message from validation errors or general message
    let errorMessage = data.message || 'API request failed';
    if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      errorMessage = data.errors.map((err: any) => 
        err.msg || err.message || `${err.param}: ${err.msg || 'Invalid value'}`
      ).join(', ');
    }
    throw new Error(errorMessage);
  }

  return data;
};

// Authentication API
export const authAPI = {
  register: async (userData: {
    email?: string;
    name?: string;
    password?: string;
    isAnonymous?: boolean;
  }) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: {
    email?: string;
    password?: string;
    isAnonymous?: boolean;
  }) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getMe: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },

  updateProfile: async (profileData: { name?: string; preferences?: any }) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Events API
export const eventsAPI = {
  getAll: async (filters?: { status?: string; category?: string; type?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.type) queryParams.append('type', filters.type);
    
    const query = queryParams.toString();
    return apiRequest(`/events${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiRequest(`/events/${id}`, {
      method: 'GET',
    });
  },

  create: async (eventData: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    type: 'offline' | 'online' | 'hybrid';
    category: 'wellness' | 'civic' | 'learning' | 'support' | 'general';
    maxParticipants?: number;
    tags?: string;
  }) => {
    return apiRequest('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  approve: async (id: string) => {
    return apiRequest(`/events/${id}/approve`, {
      method: 'PUT',
    });
  },

  reject: async (id: string) => {
    return apiRequest(`/events/${id}/reject`, {
      method: 'PUT',
    });
  },

  rsvp: async (id: string) => {
    return apiRequest(`/events/${id}/rsvp`, {
      method: 'POST',
    });
  },

  checkRSVPStatus: async (id: string) => {
    return apiRequest(`/events/${id}/rsvp-status`, {
      method: 'GET',
    });
  },

  cancelRSVP: async (id: string) => {
    return apiRequest(`/events/${id}/rsvp`, {
      method: 'DELETE',
    });
  },

  getRSVPs: async (id: string) => {
    return apiRequest(`/events/${id}/rsvps`, {
      method: 'GET',
    });
  },

  update: async (id: string, eventData: {
    title?: string;
    description?: string;
    date?: string;
    time?: string;
    location?: string;
    type?: 'offline' | 'online' | 'hybrid';
    category?: 'wellness' | 'civic' | 'learning' | 'support' | 'general';
    maxParticipants?: number;
    tags?: string;
  }) => {
    return apiRequest(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });
  },

  delete: async (id: string) => {
    return apiRequest(`/events/${id}`, {
      method: 'DELETE',
    });
  },
};

// Support Circles API
export const supportCirclesAPI = {
  getAll: async (filters?: { status?: string }) => {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    
    const query = queryParams.toString();
    return apiRequest(`/support-circles${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  getById: async (id: string) => {
    return apiRequest(`/support-circles/${id}`, {
      method: 'GET',
    });
  },

  create: async (circleData: {
    topic: string;
    description?: string;
    duration: number;
    maxParticipants?: number;
    isPrivate?: boolean;
    anonymousMode?: boolean;
    aiModeration?: boolean;
    gameType?: string;
  }) => {
    return apiRequest('/support-circles', {
      method: 'POST',
      body: JSON.stringify(circleData),
    });
  },

  join: async (id: string) => {
    return apiRequest(`/support-circles/${id}/join`, {
      method: 'POST',
    });
  },

  leave: async (id: string) => {
    return apiRequest(`/support-circles/${id}/leave`, {
      method: 'POST',
    });
  },

  joinByCode: async (joinCode: string) => {
    return apiRequest('/support-circles/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    });
  },

  end: async (id: string) => {
    return apiRequest(`/support-circles/${id}/end`, {
      method: 'POST',
    });
  },
};

// Agora API
export const agoraAPI = {
  getToken: async (channelName: string, channelType: 'support-circle' | 'event' | 'ai-voice') => {
    return apiRequest('/agora/token', {
      method: 'POST',
      body: JSON.stringify({ channelName, channelType }),
    });
  },
  getRtmToken: async (channelName: string, channelType: 'support-circle' | 'event') => {
    return apiRequest('/agora/rtm-token', {
      method: 'POST',
      body: JSON.stringify({ channelName, channelType }),
    });
  },
};

// Games API
export const gamesAPI = {
  createSession: async (roomId: string, gameType: string) => {
    return apiRequest('/games/sessions', {
      method: 'POST',
      body: JSON.stringify({ roomId, gameType }),
    });
  },
  getSession: async (roomId: string) => {
    return apiRequest(`/games/sessions/${roomId}`, {
      method: 'GET',
    });
  },
  startSession: async (sessionId: string, gameData?: any) => {
    return apiRequest(`/games/sessions/${sessionId}/start`, {
      method: 'POST',
      body: JSON.stringify({ gameData }),
    });
  },
  assignRoles: async (sessionId: string, roles: Record<string, string>) => {
    return apiRequest(`/games/sessions/${sessionId}/assign-roles`, {
      method: 'POST',
      body: JSON.stringify({ roles }),
    });
  },
  vote: async (sessionId: string, targetUserId: string) => {
    return apiRequest(`/games/sessions/${sessionId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    });
  },
  updatePhase: async (sessionId: string, phase: string, gameData?: any) => {
    return apiRequest(`/games/sessions/${sessionId}/update-phase`, {
      method: 'POST',
      body: JSON.stringify({ phase, gameData }),
    });
  },
  endSession: async (sessionId: string, results?: any) => {
    return apiRequest(`/games/sessions/${sessionId}/end`, {
      method: 'POST',
      body: JSON.stringify({ results }),
    });
  },
};

// Mood API
export const moodAPI = {
  getLastCheckIn: async () => {
    return apiRequest('/mood/last-checkin', {
      method: 'GET',
    });
  },
  record: async (moodData: { 
    moodScore: number; 
    moodEmoji?: string; 
    reflection?: string;
    mood?: number; // Legacy
    note?: string; // Legacy
  }) => {
    return apiRequest('/mood', {
      method: 'POST',
      body: JSON.stringify(moodData),
    });
  },

  getHistory: async () => {
    return apiRequest('/mood', {
      method: 'GET',
    });
  },
};

// Chat API
export const chatAPI = {
  getContext: async () => {
    return apiRequest('/chat/context', {
      method: 'GET',
    });
  },
  
  sendMessage: async (
    message: string, 
    conversationId?: string, 
    messageType: 'text' | 'voice' = 'text',
    modelSize: '8b' | '405b' = '8b'
  ) => {
    return apiRequest('/chat/message', {
      method: 'POST',
      body: JSON.stringify({ message, conversationId, messageType, modelSize }),
    });
  },
  
  getHistory: async () => {
    return apiRequest('/chat/history', {
      method: 'GET',
    });
  },
  
  clearHistory: async () => {
    return apiRequest('/chat/history', {
      method: 'DELETE',
    });
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health', {
    method: 'GET',
  });
};

