/**
 * Interest Manager Implementation
 * Handles the claim/interest flow for share posts
 */

import { IInterestManager, InterestResult } from './IInterestManager';
import { InterestAck } from '../types/InterestAck';
import { InterestResponse } from '../types/InterestResponse';
import { Unsubscribe, ResponseType } from '../types/Common';
import { ITransportRouter, TransportMessage } from '../mocks/MockTransportRouter';
import { getUserIdentifier } from '../utils/UserIdentifierGenerator';

/**
 * Interest Manager implementation
 */
export class InterestManager implements IInterestManager {
  private outgoingInterests: Map<string, InterestAck> = new Map();
  private incomingInterests: Map<string, InterestAck[]> = new Map();
  private interestHandlers: Set<(interest: InterestAck) => void> = new Set();
  private responseHandlers: Set<(response: InterestResponse) => void> = new Set();
  
  private readonly maxRetries = 5;
  private readonly retryDelays = [1000, 2000, 4000, 8000, 15000]; // Total ~30s
  
  constructor(private transportRouter: ITransportRouter) {
    console.log('[InterestManager] Initialized');
  }
  
  /**
   * Express interest in a share post
   */
  async expressInterest(postId: string): Promise<InterestResult> {
    const interestId = this.generateInterestId();
    const timestamp = Date.now();
    
    const interest: InterestAck = {
      id: interestId,
      postId,
      interestedUserId: getUserIdentifier(),
      interestedUserIdentifier: getUserIdentifier(),
      timestamp,
      status: 'pending',
    };
    
    console.log(`[InterestManager] Expressing interest in post ${postId}`);
    
    // Store in outgoing interests
    this.outgoingInterests.set(interestId, interest);
    
    // Send via transport
    const message: TransportMessage = {
      type: 'interest_ack',
      payload: interest,
    };
    
    try {
      const result = await this.transportRouter.send(message);
      if (result.success) {
        console.log(`[InterestManager] Interest sent successfully: ${interestId}`);
        return { success: true, interestId };
      } else {
        // Start retry logic
        this.startRetryLogic(interestId, message);
        return { success: true, interestId }; // Non-blocking
      }
    } catch (error) {
      // Start retry logic on failure
      console.warn(`[InterestManager] Initial send failed, starting retry logic`);
      this.startRetryLogic(interestId, message);
      return { success: true, interestId }; // Non-blocking
    }
  }
  
  /**
   * Respond to an interest (as poster)
   * @param responderId - Auth UUID when online; pass from supabase.auth.getUser() for Supabase integration
   */
  async respondToInterest(interestId: string, response: ResponseType, message?: string, responderId?: string): Promise<void> {
    console.log(`[InterestManager] Responding to interest ${interestId}: ${response}`);
    
    const interestResponse: InterestResponse = {
      interestId,
      postId: '', // Would be retrieved from interest lookup
      response,
      message,
      timestamp: Date.now(),
      ...(responderId && { responderId }),
    };
    
    // Update interest status in incoming map
    for (const [postId, interests] of this.incomingInterests.entries()) {
      const interest = interests.find(i => i.id === interestId);
      if (interest) {
        interest.status = response === 'accept' ? 'accepted' : 'declined';
        interestResponse.postId = postId;
        break;
      }
    }
    
    // Send via transport
    const transportMessage: TransportMessage = {
      type: 'interest_response',
      payload: interestResponse,
    };
    
    await this.transportRouter.send(transportMessage);
  }
  
  /**
   * Subscribe to incoming interests (for posters)
   */
  onInterestReceived(handler: (interest: InterestAck) => void): Unsubscribe {
    this.interestHandlers.add(handler);
    return () => {
      this.interestHandlers.delete(handler);
    };
  }
  
  /**
   * Subscribe to responses (for interested parties)
   */
  onResponseReceived(handler: (response: InterestResponse) => void): Unsubscribe {
    this.responseHandlers.add(handler);
    return () => {
      this.responseHandlers.delete(handler);
    };
  }
  
  /**
   * Get pending interests for a post
   */
  getPendingInterests(postId: string): InterestAck[] {
    return this.incomingInterests.get(postId) || [];
  }
  
  /**
   * Called when an interest is received from transport layer
   */
  receivedInterest(interest: InterestAck): void {
    console.log(`[InterestManager] Received interest for post ${interest.postId} from ${interest.interestedUserIdentifier}`);
    
    // Add to incoming interests queue
    if (!this.incomingInterests.has(interest.postId)) {
      this.incomingInterests.set(interest.postId, []);
    }
    this.incomingInterests.get(interest.postId)!.push(interest);
    
    // Emit event
    this.interestHandlers.forEach(handler => {
      try {
        handler(interest);
      } catch (error) {
        console.error('[InterestManager] Error in interest handler:', error);
      }
    });
  }
  
  /**
   * Called when a response is received from transport layer
   */
  receivedResponse(response: InterestResponse): void {
    console.log(`[InterestManager] Received response for interest ${response.interestId}: ${response.response}`);
    
    // Emit event
    this.responseHandlers.forEach(handler => {
      try {
        handler(response);
      } catch (error) {
        console.error('[InterestManager] Error in response handler:', error);
      }
    });
  }
  
  /**
   * Generate unique interest ID
   */
  private generateInterestId(): string {
    return `interest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
  
  /**
   * Start retry logic with exponential backoff
   */
  private startRetryLogic(interestId: string, message: TransportMessage): void {
    let attempt = 0;
    
    const retry = async () => {
      if (attempt >= this.maxRetries) {
        console.warn(`[InterestManager] Max retries reached for interest ${interestId}`);
        // Update interest with error (would notify user in production)
        return;
      }
      
      const delay = this.retryDelays[attempt];
      attempt++;
      
      console.log(`[InterestManager] Retry attempt ${attempt}/${this.maxRetries} for ${interestId} in ${delay}ms`);
      
      setTimeout(async () => {
        try {
          const result = await this.transportRouter.send(message);
          if (result.success) {
            console.log(`[InterestManager] Retry successful for ${interestId}`);
          } else {
            retry(); // Continue retrying
          }
        } catch (error) {
          retry(); // Continue retrying
        }
      }, delay);
    };
    
    retry();
  }
  
  /**
   * Get count of outgoing interests
   */
  getOutgoingCount(): number {
    return this.outgoingInterests.size;
  }
  
  /**
   * Get count of incoming interests across all posts
   */
  getIncomingCount(): number {
    let total = 0;
    for (const interests of this.incomingInterests.values()) {
      total += interests.length;
    }
    return total;
  }
  
  /**
   * Dispose of the manager and cleanup resources
   */
  dispose(): void {
    this.outgoingInterests.clear();
    this.incomingInterests.clear();
    this.interestHandlers.clear();
    this.responseHandlers.clear();
    console.log('[InterestManager] Disposed');
  }
}
