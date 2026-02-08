/**
 * Supabase Row Mapping Utilities
 * Converts between app types (camelCase, Unix ms) and Supabase rows (snake_case, ISO timestamps)
 * For use by Person 2's transport layer when integrating with Supabase
 */

import { SharePost } from '../types/SharePost';
import { InterestAck } from '../types/InterestAck';
import { RiskTier, InterestStatus } from '../types/Common';

/** Supabase share_posts row format (snake_case) */
export interface SharePostRow {
  id: string;
  author_id: string;
  author_identifier: string;
  title: string;
  description: string | null;
  risk_tier: RiskTier;
  created_at: string;
  expires_at: string;
  location?: string | object;
  is_active?: boolean;
}

/** Supabase interests row format (snake_case) */
export interface InterestRow {
  id: string;
  post_id: string;
  interested_user_id: string;
  interested_user_identifier: string;
  status: InterestStatus;
  created_at: string;
}

/** Insert payload for share_posts (omits id, created_at if using defaults) */
export interface SharePostInsertRow {
  author_id: string;
  author_identifier: string;
  title: string;
  description?: string | null;
  risk_tier: RiskTier;
  created_at?: string;
  expires_at: string;
  location?: string | object;
  is_active?: boolean;
}

/** Insert payload for interests (omits id, created_at if using defaults) */
export interface InterestInsertRow {
  post_id: string;
  interested_user_id: string;
  interested_user_identifier: string;
  status?: InterestStatus;
  created_at?: string;
}

/**
 * Convert SharePost (app format) to Supabase row format
 */
export function postToSupabaseRow(post: SharePost): SharePostRow & SharePostInsertRow {
  const row: SharePostRow & SharePostInsertRow = {
    id: post.id,
    author_id: post.authorId,
    author_identifier: post.authorIdentifier,
    title: post.title,
    description: post.description ?? null,
    risk_tier: post.riskTier,
    created_at: new Date(post.createdAt).toISOString(),
    expires_at: new Date(post.expiresAt).toISOString(),
  };
  if (post.location?.latitude != null && post.location?.longitude != null) {
    row.location = `POINT(${post.location.longitude} ${post.location.latitude})`;
  }
  return row;
}

/**
 * Convert Supabase share_posts row to SharePost (app format)
 */
export function supabaseRowToPost(row: SharePostRow): SharePost {
  const createdAt = new Date(row.created_at).getTime();
  const expiresAt = new Date(row.expires_at).getTime();
  const ttl = expiresAt - createdAt;

  let location: SharePost['location'] | undefined;
  if (row.location && typeof row.location === 'object') {
    const geo = row.location as { coordinates?: [number, number] };
    if (geo.coordinates && Array.isArray(geo.coordinates) && geo.coordinates.length >= 2) {
      location = {
        longitude: geo.coordinates[0],
        latitude: geo.coordinates[1],
      };
    }
  }

  return {
    id: row.id,
    authorId: row.author_id,
    authorIdentifier: row.author_identifier,
    title: row.title,
    description: row.description ?? '',
    riskTier: row.risk_tier,
    ttl,
    createdAt,
    expiresAt,
    source: 'supabase',
    ...(location && { location }),
  };
}

/**
 * Convert InterestAck (app format) to Supabase row format
 */
export function interestToSupabaseRow(interest: InterestAck): InterestRow & InterestInsertRow {
  return {
    id: interest.id,
    post_id: interest.postId,
    interested_user_id: interest.interestedUserId,
    interested_user_identifier: interest.interestedUserIdentifier,
    status: interest.status,
    created_at: new Date(interest.timestamp).toISOString(),
  };
}

/**
 * Convert Supabase interests row to InterestAck (app format)
 */
export function supabaseRowToInterest(row: InterestRow): InterestAck {
  return {
    id: row.id,
    postId: row.post_id,
    interestedUserId: row.interested_user_id,
    interestedUserIdentifier: row.interested_user_identifier,
    status: row.status,
    timestamp: new Date(row.created_at).getTime(),
    source: 'supabase',
  };
}
