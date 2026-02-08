/**
 * SurvivalTabBar Usage Examples
 * Demonstrates how to use the SurvivalTabBar component
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { SurvivalTabBar, SurvivalTab } from './SurvivalTabBar';

// ============================================
// Example 1: Basic Usage
// ============================================

export function BasicSurvivalTabBarExample(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SurvivalTab>('community');

  return (
    <SurvivalTabBar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sosUnreadCount={0}
    />
  );
}

// ============================================
// Example 2: With SOS Unread Badge
// ============================================

export function SurvivalTabBarWithBadgeExample(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SurvivalTab>('community');
  const sosUnreadCount = 5; // 5 unread SOS messages

  return (
    <SurvivalTabBar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      sosUnreadCount={sosUnreadCount}
    />
  );
}

// ============================================
// Example 3: With Tab Change Handler
// ============================================

export function SurvivalTabBarWithHandlerExample(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SurvivalTab>('community');

  const handleTabChange = (tab: SurvivalTab) => {
    console.log(`Switching to ${tab} tab`);
    setActiveTab(tab);
    
    // Additional logic when tab changes
    if (tab === 'sos') {
      // Mark SOS messages as read, etc.
      console.log('Viewing SOS messages');
    }
  };

  return (
    <SurvivalTabBar
      activeTab={activeTab}
      onTabChange={handleTabChange}
      sosUnreadCount={3}
    />
  );
}

// ============================================
// Example 4: Complete Survival Mode Layout
// ============================================

export function CompleteSurvivalLayoutExample(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<SurvivalTab>('community');
  const [sosUnreadCount, setSosUnreadCount] = useState(2);

  const handleTabChange = (tab: SurvivalTab) => {
    setActiveTab(tab);
    
    // Clear unread count when viewing SOS tab
    if (tab === 'sos') {
      setSosUnreadCount(0);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Tab Bar */}
      <SurvivalTabBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        sosUnreadCount={sosUnreadCount}
      />

      {/* Tab Content */}
      <View style={{ flex: 1 }}>
        {activeTab === 'community' ? (
          <View>{/* Community Board Content */}</View>
        ) : (
          <View>{/* SOS Board Content */}</View>
        )}
      </View>
    </View>
  );
}

// ============================================
// Example 5: With Scroll Position Persistence
// ============================================

/**
 * For a complete implementation with scroll position persistence,
 * use the SurvivalTabBarWithScroll component instead.
 * 
 * See: SurvivalTabBarWithScroll.tsx
 * 
 * Example usage:
 * 
 * import { SurvivalTabBarWithScroll } from './SurvivalTabBarWithScroll';
 * 
 * <SurvivalTabBarWithScroll
 *   communityContent={<CommunityBoard />}
 *   sosContent={<SOSBoard />}
 *   sosUnreadCount={3}
 *   onTabChange={(tab) => console.log('Switched to', tab)}
 * />
 * 
 * This component automatically handles:
 * - Scroll position tracking for each tab
 * - Instant tab switching (no animation)
 * - Scroll position restoration when switching back
 * - Independent scroll positions for each tab
 */

// ============================================
// Usage Notes
// ============================================

/**
 * USAGE NOTES:
 * 
 * 1. Tab Switching:
 *    - Tab changes are instant (no animation) per Requirement 2.7
 *    - Use the onTabChange callback to handle tab switches
 * 
 * 2. SOS Badge:
 *    - Badge only shows when sosUnreadCount > 0 (Requirement 2.9)
 *    - Badge displays red circle with count
 *    - Update sosUnreadCount when user views SOS tab
 * 
 * 3. Accessibility:
 *    - Component is fully keyboard accessible (Requirement 2.10)
 *    - Screen readers announce tab state and unread counts
 *    - Use accessibilityLabel for custom announcements
 * 
 * 4. Styling:
 *    - Height is fixed at 44px (minimum touch target)
 *    - Active tab: White text + 2px mint green underline
 *    - Inactive tab: Gray text
 *    - System font, 16px, weight 600
 * 
 * 5. Scroll Position:
 *    - Implement scroll position persistence in parent component
 *    - Save scroll position before tab change
 *    - Restore scroll position after tab change
 */
