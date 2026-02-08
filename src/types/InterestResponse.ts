/**
 * Interest Response data model
 * Represents the poster's response to an interest acknowledgment
 */

import { ResponseType } from './Common';

export interface InterestResponse {
  /** ID of the interest being responded to */
  interestId: string;
  
  /** ID of the original post */
  postId: string;
  
  /** Accept or decline */
  response: ResponseType;
  
  /** Optional message from poster */
  message?: string;
  
  /** Timestamp of the response (Unix epoch ms) */
  timestamp: number;

  /** ID of the poster who responded (auth UUID when online) */
  responderId?: string;
}
