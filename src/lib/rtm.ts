// Agora RTM (Real-Time Messaging) client wrapper
import { RTM } from 'agora-rtm-sdk';
import { agoraAPI } from './api';

export interface RTMMessage {
  type: string;
  data: any;
  timestamp?: number;
  from?: string;
}

export class RTMClient {
  private client: any = null;
  private channelName: string = '';
  private userId: string = '';
  private appId: string = '';
  private isConnected: boolean = false;
  private messageHandlers: Map<string, Set<(message: RTMMessage) => void>> = new Map();

  async initialize(channelName: string, channelType: 'support-circle' | 'event'): Promise<void> {
    try {
      // Get RTM token from backend
      const response = await agoraAPI.getRtmToken(channelName, channelType);
      this.appId = response.appId;
      this.userId = response.userId;

      // Create RTM client
      this.client = new RTM(this.appId, this.userId);
      
      // Login
      await this.client.login({ token: response.token });
      
      // Store channel name
      this.channelName = channelName;
      
      // Subscribe to channel
      await this.client.subscribe(channelName, { withMessage: true });

      // Set up message handlers
      this.client.addEventListener('message', (event: any) => {
        try {
          if (event.channelName === channelName) {
            const msg: RTMMessage = JSON.parse(
              typeof event.message === 'string' ? event.message : new TextDecoder().decode(event.message)
            );
            this.handleMessage(msg, event.publisher);
          }
        } catch (error) {
          console.error('Error parsing RTM message:', error);
        }
      });

      this.isConnected = true;
      console.log('✅ RTM client connected to channel:', channelName);
    } catch (error) {
      console.error('RTM initialization error:', error);
      throw error;
    }
  }

  private handleMessage(message: RTMMessage, from: string) {
    message.from = from;
    message.timestamp = Date.now();
    
    const handlers = this.messageHandlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }
    
    // Also call 'message' handlers for all messages
    const allHandlers = this.messageHandlers.get('*');
    if (allHandlers) {
      allHandlers.forEach((handler) => handler(message));
    }
  }

  on(messageType: string, handler: (message: RTMMessage) => void) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, new Set());
    }
    this.messageHandlers.get(messageType)!.add(handler);
  }

  off(messageType: string, handler: (message: RTMMessage) => void) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async sendMessage(type: string, data: any, targetUserId?: string): Promise<void> {
    if (!this.isConnected || !this.client) {
      throw new Error('RTM client not connected');
    }

    const message: RTMMessage = {
      type,
      data,
      timestamp: Date.now(),
    };

    try {
      if (targetUserId) {
        // Send peer-to-peer message
        await this.client.publish(targetUserId, JSON.stringify(message), { channelType: 'USER' });
      } else {
        // Send channel message
        await this.client.publish(this.channelName, JSON.stringify(message));
      }
    } catch (error) {
      console.error('Error sending RTM message:', error);
      throw error;
    }
  }

  async sendDirectMessage(userId: string, type: string, data: any): Promise<void> {
    await this.sendMessage(type, data, userId);
  }

  async leave(): Promise<void> {
    try {
      if (this.client && this.channelName) {
        await this.client.unsubscribe(this.channelName);
        this.channelName = '';
      }
      if (this.client) {
        await this.client.logout();
        this.client = null;
      }
      this.isConnected = false;
      this.messageHandlers.clear();
    } catch (error) {
      console.error('Error leaving RTM channel:', error);
    }
  }

  getUserId(): string {
    return this.userId;
  }

  getIsConnected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance (optional, can create multiple instances)
let rtmInstance: RTMClient | null = null;

export const getRTMClient = (): RTMClient => {
  if (!rtmInstance) {
    rtmInstance = new RTMClient();
  }
  return rtmInstance;
};

