/**
 * SurvivalTabBarWithScroll Component
 * Wrapper component that manages tab bar with scroll position persistence
 * 
 * Requirements: 2.7, 2.8 (Instant tab switching with scroll position persistence)
 */

import React, { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SurvivalTabBar, SurvivalTab } from './SurvivalTabBar';

// ============================================
// Types and Interfaces
// ============================================

export interface SurvivalTabBarWithScrollProps {
  /** Content to render in Community tab */
  communityContent: React.ReactNode;
  /** Content to render in SOS tab */
  sosContent: React.ReactNode;
  /** Number of unread SOS messages */
  sosUnreadCount: number;
  /** Initial active tab */
  initialTab?: SurvivalTab;
  /** Callback when tab changes */
  onTabChange?: (tab: SurvivalTab) => void;
  /** Test ID for testing */
  testID?: string;
}

interface ScrollPosition {
  x: number;
  y: number;
}

// ============================================
// SurvivalTabBarWithScroll Component
// ============================================

/**
 * Component that wraps SurvivalTabBar with scroll position persistence
 * 
 * Requirement 2.7: Tab switch has no animation (instant)
 * Requirement 2.8: Tabs persist scroll position when switching
 */
export function SurvivalTabBarWithScroll({
  communityContent,
  sosContent,
  sosUnreadCount,
  initialTab = 'community',
  onTabChange,
  testID = 'survival-tab-bar-with-scroll',
}: SurvivalTabBarWithScrollProps): React.JSX.Element {
  // Active tab state
  const [activeTab, setActiveTab] = useState<SurvivalTab>(initialTab);

  // Scroll position state for each tab
  // Requirement 2.8: Persist scroll position when switching
  const [communityScrollPosition, setCommunityScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });
  const [sosScrollPosition, setSosScrollPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
  });

  // Refs for ScrollView components
  const communityScrollRef = useRef<ScrollView>(null);
  const sosScrollRef = useRef<ScrollView>(null);

  // Track if we need to restore scroll position
  const shouldRestoreScroll = useRef(false);

  /**
   * Handle scroll events to save current position
   * Requirement 2.8: Persist scroll position when switching
   */
  const handleCommunityScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number; y: number } } }) => {
      const { x, y } = event.nativeEvent.contentOffset;
      setCommunityScrollPosition({ x, y });
    },
    []
  );

  const handleSOSScroll = useCallback(
    (event: { nativeEvent: { contentOffset: { x: number; y: number } } }) => {
      const { x, y } = event.nativeEvent.contentOffset;
      setSosScrollPosition({ x, y });
    },
    []
  );

  /**
   * Handle tab change with scroll position restoration
   * Requirement 2.7: No animation on tab change (instant)
   * Requirement 2.8: Persist scroll position when switching
   */
  const handleTabChange = useCallback(
    (tab: SurvivalTab) => {
      // Mark that we need to restore scroll position
      shouldRestoreScroll.current = true;

      // Update active tab (instant, no animation)
      setActiveTab(tab);

      // Call parent callback if provided
      onTabChange?.(tab);

      // Restore scroll position after render
      // Use setTimeout to ensure the ScrollView is mounted
      setTimeout(() => {
        if (shouldRestoreScroll.current) {
          if (tab === 'community' && communityScrollRef.current) {
            communityScrollRef.current.scrollTo({
              x: communityScrollPosition.x,
              y: communityScrollPosition.y,
              animated: false, // Requirement 2.7: No animation
            });
          } else if (tab === 'sos' && sosScrollRef.current) {
            sosScrollRef.current.scrollTo({
              x: sosScrollPosition.x,
              y: sosScrollPosition.y,
              animated: false, // Requirement 2.7: No animation
            });
          }
          shouldRestoreScroll.current = false;
        }
      }, 0);
    },
    [communityScrollPosition, sosScrollPosition, onTabChange]
  );

  return (
    <View style={styles.container} testID={testID}>
      {/* Tab Bar */}
      <SurvivalTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sosUnreadCount={sosUnreadCount}
        testID={`${testID}-tab-bar`}
      />

      {/* Tab Content with Scroll Position Persistence */}
      <View style={styles.contentContainer}>
        {/* Community Tab Content */}
        {activeTab === 'community' && (
          <ScrollView
            ref={communityScrollRef}
            style={styles.scrollView}
            onScroll={handleCommunityScroll}
            scrollEventThrottle={16} // Smooth scroll tracking
            testID={`${testID}-community-scroll`}
          >
            {communityContent}
          </ScrollView>
        )}

        {/* SOS Tab Content */}
        {activeTab === 'sos' && (
          <ScrollView
            ref={sosScrollRef}
            style={styles.scrollView}
            onScroll={handleSOSScroll}
            scrollEventThrottle={16} // Smooth scroll tracking
            testID={`${testID}-sos-scroll`}
          >
            {sosContent}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

// ============================================
// Export
// ============================================

export default SurvivalTabBarWithScroll;
