/**
 * PresenceDisplay Component
 * Combines PresenceIndicator with PresenceTooltip for complete presence UI.
 * Handles online-only mode display.
 *
 * Requirements: 3.6, 4.1, 4.2, 4.3, 4.4, 4.5
 */

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ConnectivityMode } from '../../types';
import { PresenceIndicator } from './PresenceIndicator';
import { PresenceTooltip } from './PresenceTooltip';

export interface PresenceDisplayProps {
  peerCount: number;
  connectivityMode: ConnectivityMode;
}

/**
 * Determines if the presence display should show "Online mode" text
 * Property 12: Online-Only Mode Indicator
 */
export function isOnlineOnlyMode(mode: ConnectivityMode): boolean {
  return mode === 'online';
}

export function PresenceDisplay({
  peerCount,
  connectivityMode,
}: PresenceDisplayProps): React.JSX.Element {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleIndicatorPress = () => {
    setTooltipVisible(true);
  };

  const handleTooltipClose = () => {
    setTooltipVisible(false);
  };

  return (
    <View style={styles.container}>
      <PresenceIndicator
        peerCount={peerCount}
        connectivityMode={connectivityMode}
        onPress={handleIndicatorPress}
      />
      <PresenceTooltip
        visible={tooltipVisible}
        onClose={handleTooltipClose}
        peerCount={peerCount}
        connectivityMode={connectivityMode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
});

// ============================================
// Memoized Export
// Requirements: 9.2 - Minimize component re-renders using React.memo
// ============================================

export const MemoizedPresenceDisplay = React.memo(PresenceDisplay);
MemoizedPresenceDisplay.displayName = 'PresenceDisplay';

export default MemoizedPresenceDisplay;
