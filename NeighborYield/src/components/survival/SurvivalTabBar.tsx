/**
 * SurvivalTabBar Component
 * Two-tab segmented control for Community Board and SOS
 * Optimized for survival mode with high contrast and minimal animations
 *
 * Requirements: 2.1-2.10 (Two-Tab Interface)
 */

import React, { useCallback, useMemo, useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, Platform } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

// ============================================
// Types and Interfaces
// ============================================

export type SurvivalTab = 'community' | 'sos';

export interface SurvivalTabBarProps {
  /** Currently active tab */
  activeTab: SurvivalTab;
  /** Callback when tab changes */
  onTabChange: (tab: SurvivalTab) => void;
  /** Number of unread SOS messages */
  sosUnreadCount: number;
  /** Test ID for testing */
  testID?: string;
}

// ============================================
// Constants
// ============================================

const TAB_BAR_HEIGHT = 44; // Requirement 2.5: 44px minimum touch target
const UNDERLINE_HEIGHT = 2;
const FONT_SIZE = 16; // Requirement 2.6: 16px font size
const FONT_WEIGHT = '600'; // Requirement 2.6: weight 600

// ============================================
// SurvivalTabBar Component
// ============================================

function SurvivalTabBarComponent({
  activeTab,
  onTabChange,
  sosUnreadCount,
  testID = 'survival-tab-bar',
}: SurvivalTabBarProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { colors } = tokens;

  // Refs for keyboard navigation
  const communityTabRef = useRef<any>(null);
  const sosTabRef = useRef<any>(null);

  // Handle tab press
  // Requirement 2.7: No animation on tab change (instant)
  const handleCommunityPress = useCallback(() => {
    if (activeTab !== 'community') {
      onTabChange('community');
    }
  }, [activeTab, onTabChange]);

  const handleSOSPress = useCallback(() => {
    if (activeTab !== 'sos') {
      onTabChange('sos');
    }
  }, [activeTab, onTabChange]);

  // Keyboard navigation support (web/desktop platforms)
  // Requirement 2.10: Keyboard accessible
  useEffect(() => {
    if (Platform.OS !== 'web') return undefined;

    const handleKeyDown = (event: any) => {
      // Arrow key navigation
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        
        if (event.key === 'ArrowLeft' && activeTab === 'sos') {
          handleCommunityPress();
          communityTabRef.current?.focus();
        } else if (event.key === 'ArrowRight' && activeTab === 'community') {
          handleSOSPress();
          sosTabRef.current?.focus();
        }
      }
      
      // Home/End key navigation
      if (event.key === 'Home') {
        event.preventDefault();
        handleCommunityPress();
        communityTabRef.current?.focus();
      } else if (event.key === 'End') {
        event.preventDefault();
        handleSOSPress();
        sosTabRef.current?.focus();
      }
    };

    // Add event listener to document (web only)
    // @ts-ignore - window is available on web platform
    if (typeof globalThis !== 'undefined' && globalThis.document) {
      // @ts-ignore
      globalThis.document.addEventListener('keydown', handleKeyDown);

      return () => {
        // @ts-ignore
        globalThis.document.removeEventListener('keydown', handleKeyDown);
      };
    }

    return undefined;
  }, [activeTab, handleCommunityPress, handleSOSPress]);

  // Determine if tabs are active
  const isCommunityActive = activeTab === 'community';
  const isSOSActive = activeTab === 'sos';

  // Accessibility labels
  // Requirement 2.10: Keyboard accessible
  const communityAccessibilityLabel = useMemo(
    () => `Community Board tab${isCommunityActive ? ', selected' : ''}`,
    [isCommunityActive]
  );

  const communityAccessibilityHint = useMemo(
    () => (isCommunityActive ? 'Currently viewing Community Board' : 'Switch to Community Board to view Have and Want posts'),
    [isCommunityActive]
  );

  const sosAccessibilityLabel = useMemo(() => {
    const unreadText = sosUnreadCount > 0 ? `, ${sosUnreadCount} unread` : '';
    const selectedText = isSOSActive ? ', selected' : '';
    return `SOS tab${unreadText}${selectedText}`;
  }, [isSOSActive, sosUnreadCount]);

  const sosAccessibilityHint = useMemo(() => {
    if (isSOSActive) {
      return sosUnreadCount > 0 
        ? `Currently viewing SOS board with ${sosUnreadCount} unread emergency messages`
        : 'Currently viewing SOS board';
    }
    return sosUnreadCount > 0
      ? `Switch to SOS board to view ${sosUnreadCount} unread emergency messages`
      : 'Switch to SOS board to view emergency help requests';
  }, [isSOSActive, sosUnreadCount]);

  return (
    <View
      style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}
      testID={testID}
    >
      {/* Community Board Tab */}
      <Pressable
        ref={communityTabRef}
        onPress={handleCommunityPress}
        style={styles.tabButton}
        accessibilityRole="tab"
        accessibilityLabel={communityAccessibilityLabel}
        accessibilityHint={communityAccessibilityHint}
        accessibilityState={{ selected: isCommunityActive }}
        accessible={true}
        focusable={true}
        testID={`${testID}-community`}
      >
        <View style={styles.tabContent}>
          {/* Tab Label */}
          <Text
            style={[
              styles.tabText,
              {
                // Requirement 2.3: Active tab white text, inactive gray
                color: isCommunityActive ? colors.textPrimary : colors.textSecondary,
              },
            ]}
          >
            Community Board
          </Text>

          {/* Active Indicator */}
          {/* Requirement 2.4: Active tab has subtle underline indicator */}
          {isCommunityActive && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: colors.accentPrimary }, // #4AEDC4
              ]}
            />
          )}
        </View>
      </Pressable>

      {/* SOS Tab */}
      <Pressable
        ref={sosTabRef}
        onPress={handleSOSPress}
        style={styles.tabButton}
        accessibilityRole="tab"
        accessibilityLabel={sosAccessibilityLabel}
        accessibilityHint={sosAccessibilityHint}
        accessibilityState={{ selected: isSOSActive }}
        accessible={true}
        focusable={true}
        testID={`${testID}-sos`}
      >
        <View style={styles.tabContent}>
          {/* Tab Label with Badge */}
          <View style={styles.sosLabelContainer}>
            <Text
              style={[
                styles.tabText,
                {
                  // Requirement 2.3: Active tab white text, inactive gray
                  color: isSOSActive ? colors.textPrimary : colors.textSecondary,
                },
              ]}
            >
              SOS
            </Text>

            {/* Unread Badge */}
            {/* Requirement 2.9: Show unread count badges for SOS */}
            {sosUnreadCount > 0 && (
              <View
                style={[styles.badge, { backgroundColor: colors.accentDanger }]}
                testID={`${testID}-sos-badge`}
              >
                <Text style={styles.badgeText}>{sosUnreadCount}</Text>
              </View>
            )}
          </View>

          {/* Active Indicator */}
          {/* Requirement 2.4: Active tab has subtle underline indicator */}
          {isSOSActive && (
            <View
              style={[
                styles.activeIndicator,
                { backgroundColor: colors.accentPrimary }, // #4AEDC4
              ]}
            />
          )}
        </View>
      </Pressable>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    height: TAB_BAR_HEIGHT, // Requirement 2.5: 44px minimum touch target
    flexDirection: 'row',
    alignItems: 'stretch',
    // Requirement 2.2: Displayed as segmented control below the island
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Requirement 2.5: 44px minimum touch target (height from container)
  },
  tabContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: FONT_SIZE, // Requirement 2.6: 16px
    fontWeight: FONT_WEIGHT, // Requirement 2.6: weight 600
    // Requirement 2.6: System font (default)
    // Requirement 2.3: High-contrast colors (white text on dark)
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: UNDERLINE_HEIGHT, // Requirement 2.4: 2px underline
    // Color set dynamically from theme (#4AEDC4)
  },
  sosLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    // Requirement 2.9: Red circle with count
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

// ============================================
// Memoized Export
// ============================================

export const SurvivalTabBar = React.memo(SurvivalTabBarComponent);
SurvivalTabBar.displayName = 'SurvivalTabBar';

export default SurvivalTabBar;
