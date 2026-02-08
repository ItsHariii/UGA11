/**
 * Interest Manager Interface
 * Handles the claim/interest flow for share posts
 */

import { InterestAck } from '../types/InterestAck';
import { InterestResponse } from '../types/InterestResponse';
import { Unsubscribe, InterestError, ResponseType } from '../types/Common';

export interface InterestResult {
  success: boolean;
  interestId?: string;
  error?: InterestError;
}

export interface IInterestManager {
  /**
   * Express interest in a share post
   */
  expressInterest(postId: string): Promise<InterestResult>;
  
  /**
   * Respond to an interest (as poster)
   * @param responderId - Auth UUID when online; transport layer should pass from supabase.auth.getUser()
   */
  respondToInterest(interestId: string, response: ResponseType, message?: string, responderId?: string): Promise<void>;
  
  /**
   * Subscribe to incoming interests (for posters)
   */
  onInterestReceived(handler: (interest: InterestAck) => void): Unsubscribe;
  
  /**
   * Subscribe to responses (for interested parties)
   */
  onResponseReceived(handler: (response: InterestResponse) => void): Unsubscribe;
  
  /**
   * Get pending interests for a post
   */
  getPendingInterests(postId: string): InterestAck[];
  
  /**
   * Called when an interest is received from transport layer
   * @internal Used by transport layer
   */
  receivedInterest(interest: InterestAck): void;
  
  /**
   * Called when a response is received from transport layer
   * @internal Used by transport layer
   */
  receivedResponse(response: InterestResponse): void;
}
