/**
 * SharePostCard Component
 * Displays a share post with title, description, author, risk tier badge,
 * relative time indicator, and TTL warning when < 5 minutes remaining.
 *
 * Requirements: 5.4, 5.5, 6.5
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { RiskTier, SharePost } from '../../types';

export interface SharePostCardProps {
  post: SharePost;
  onInterestPress?: (postId: string) => void;
  currentTime?: number; // For testing purposes
}

/**
 * Formats the relative time string for display
 * Returns "posted X min ago" format
 */
export function formatRelativeTime(createdAt: number, currentTime: number): string {
  const diffMs = currentTime - createdAt;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return 'posted just now';
  } else if (diffMinutes === 1) {
    return 'posted 1 min ago';
  } else {
    return `posted ${diffMinutes} min ago`;
  }
}

/**
 * Calculates remaining TTL in milliseconds
 */
export function getRemainingTTL(expiresAt: number, currentTime: number): number {
  return Math.max(0, expiresAt - currentTime);
}

/**
 * Checks if post is in warning state (< 5 minutes remaining)
 */
export function isInWarningState(expiresAt: number, currentTime: number): boolean {
  const remainingMs = getRemainingTTL(expiresAt, currentTime);
  const fiveMinutesMs = 5 * 60 * 1000;
  return remainingMs < fiveMinutesMs && remainingMs > 0;
}

/**
 * Returns display label for risk tier
 */
export function getRiskTierLabel(tier: RiskTier): string {
  const labels: Record<RiskTier, string> = {
    high: 'High Risk',
    medium: 'Medium Risk',
    low: 'Low Risk',
  };
  return labels[tier];
}


/**
 * Returns color for risk tier badge
 */
function getRiskTierColor(tier: RiskTier): string {
  const colors: Record<RiskTier, string> = {
    high: '#d32f2f',
    medium: '#f57c00',
    low: '#388e3c',
  };
  return colors[tier];
}

export function SharePostCard({
  post,
  currentTime = Date.now(),
}: SharePostCardProps): React.JSX.Element {
  const relativeTime = useMemo(
    () => formatRelativeTime(post.createdAt, currentTime),
    [post.createdAt, currentTime]
  );

  const showWarning = useMemo(
    () => isInWarningState(post.expiresAt, currentTime),
    [post.expiresAt, currentTime]
  );

  const riskTierColor = getRiskTierColor(post.riskTier);

  return (
    <View style={[styles.container, showWarning && styles.warningContainer]}>
      <View style={styles.header}>
        <View style={[styles.riskBadge, { backgroundColor: riskTierColor }]}>
          <Text style={styles.riskBadgeText}>{getRiskTierLabel(post.riskTier)}</Text>
        </View>
        {showWarning && (
          <View style={styles.warningBadge}>
            <Text style={styles.warningBadgeText}>⚠ Expiring Soon</Text>
          </View>
        )}
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.description} numberOfLines={3}>
        {post.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.author}>{post.authorIdentifier}</Text>
        <Text style={[styles.timeIndicator, showWarning && styles.warningText]}>
          {relativeTime}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningContainer: {
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  riskBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: '#fff3e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  warningBadgeText: {
    color: '#e65100',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '500',
  },
  timeIndicator: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  warningText: {
    color: '#e65100',
    fontWeight: '500',
  },
});

export default SharePostCard;
