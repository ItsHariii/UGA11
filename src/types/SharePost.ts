/**
 * Share Post data model
 * Represents a food sharing announcement
 */

import { RiskTier } from './Common';

export interface SharePost {
  /** Unique identifier for the post */
  id: string;
  
  /** ID of the user who created the post */
  authorId: string;
  
  /** Pseudonymous identifier (e.g., "Neighbor-A3F9") */
  authorIdentifier: string;
  
  /** Title of the share offering */
  title: string;
  
  /** Detailed description of the food items */
  description: string;
  
  /** Additional content or notes */
  content?: string;
  
  /** Location information (optional) */
  location?: {
    latitude?: number;
    longitude?: number;
    description?: string;
  };
  
  /** Risk classification for TTL calculation */
  riskTier: RiskTier;
  
  /** Time-to-live in milliseconds */
  ttl: number;
  
  /** Timestamp when post was created (Unix epoch ms) */
  createdAt: number;
  
  /** Timestamp when post expires (Unix epoch ms) */
  expiresAt: number;

  /** Origin of the post: local (mesh) or supabase (cloud) */
  source?: 'local' | 'supabase';
}
