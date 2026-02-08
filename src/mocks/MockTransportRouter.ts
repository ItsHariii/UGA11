/**
 * Mock Transport Router
 * Simulates the transport layer for standalone business logic testing
 */

import { MessageType, ConnectivityMode, Unsubscribe } from '../types/Common';

export interface TransportMessage {
  type: MessageType;
  payload: unknown;
  targetEndpoint?: string;
  ttl?: number;
}

export interface SendResult {
  success: boolean;
  error?: string;
}

export type MessageHandler = (message: TransportMessage) => void;

export interface ITransportRouter {
  getMode(): ConnectivityMode;
  send(message: TransportMessage): Promise<SendResult>;
  subscribe(handler: MessageHandler): Unsubscribe;
  onModeChange(handler: (mode: ConnectivityMode) => void): Unsubscribe;
}

/**
 * Mock implementation of Transport Router for testing
 */
export class MockTransportRouter implements ITransportRouter {
  private currentMode: ConnectivityMode = 'hybrid';
  private messageHandlers: Set<MessageHandler> = new Set();
  private modeChangeHandlers: Set<(mode: ConnectivityMode) => void> = new Set();
  private sentMessages: TransportMessage[] = [];
  
  /**
   * Get current connectivity mode
   */
  getMode(): ConnectivityMode {
    return this.currentMode;
  }
  
  /**
   * Send a message via transport layer (simulated)
   */
  async send(message: TransportMessage): Promise<SendResult> {
    console.log(`[MockTransport] Sending ${message.type}:`, {
      target: message.targetEndpoint || 'broadcast',
      payloadPreview: JSON.stringify(message.payload).substring(0, 100)
    });
    
    this.sentMessages.push(message);
    
    // Simulate successful send
    return { success: true };
  }
  
  /**
   * Subscribe to incoming messages
   */
  subscribe(handler: MessageHandler): Unsubscribe {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }
  
  /**
   * Subscribe to connectivity mode changes
   */
  onModeChange(handler: (mode: ConnectivityMode) => void): Unsubscribe {
    this.modeChangeHandlers.add(handler);
    return () => {
      this.modeChangeHandlers.delete(handler);
    };
  }
  
  /**
   * Simulate mode change (for testing)
   */
  setMode(mode: ConnectivityMode): void {
    if (this.currentMode !== mode) {
      this.currentMode = mode;
      console.log(`[MockTransport] Mode changed to: ${mode}`);
      this.modeChangeHandlers.forEach(handler => handler(mode));
    }
  }
  
  /**
   * Simulate receiving a message (for testing)
   */
  simulateIncomingMessage(message: TransportMessage): void {
    console.log(`[MockTransport] Simulating incoming ${message.type}`);
    this.messageHandlers.forEach(handler => handler(message));
  }
  
  /**
   * Get sent messages history (for testing)
   */
  getSentMessages(): TransportMessage[] {
    return [...this.sentMessages];
  }
  
  /**
   * Clear sent messages history (for testing)
   */
  clearHistory(): void {
    this.sentMessages = [];
  }
}
