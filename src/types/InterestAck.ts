/**
 * Interest Acknowledgment data model
 * Represents a user's expression of interest in a share post
 */

import { InterestStatus } from './Common';

export interface InterestAck {
  /** Unique identifier for this interest */
  id: string;
  
  /** ID of the post being claimed */
  postId: string;
  
  /** ID of the interested user */
  interestedUserId: string;
  
  /** Pseudonymous identifier of interested user (e.g., "Neighbor-B7D2") */
  interestedUserIdentifier: string;
  
  /** Timestamp when interest was expressed (Unix epoch ms) */
  timestamp: number;
  
  /** Current status of the interest */
  status: InterestStatus;

  /** Origin of the interest: local (mesh) or supabase (cloud) */
  source?: 'local' | 'supabase';
}
