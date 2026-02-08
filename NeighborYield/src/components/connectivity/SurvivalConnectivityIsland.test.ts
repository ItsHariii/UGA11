/**
 * Unit tests for SurvivalConnectivityIsland component
 * Tests utility functions and component behavior
 */

import {
  formatRelativeTime,
  getBatteryColor,
  getBatteryIcon,
} from './SurvivalConnectivityIsland';

// ============================================
// formatRelativeTime Tests
// ============================================

describe('formatRelativeTime', () => {
  it('should return "now" for times less than 60 seconds ago', () => {
    const now = Date.now();
    const thirtySecondsAgo = now - 30 * 1000;
    expect(formatRelativeTime(thirtySecondsAgo)).toBe('now');
  });

  it('should return minutes for times less than 60 minutes ago', () => {
    const now = Date.now();
    const twoMinutesAgo = now - 2 * 60 * 1000;
    expect(formatRelativeTime(twoMinutesAgo)).toBe('2m');
  });

  it('should return hours for times less than 24 hours ago', () => {
    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;
    expect(formatRelativeTime(threeHoursAgo)).toBe('3h');
  });

  it('should return days for times 24 hours or more ago', () => {
    const now = Date.now();
    const twoDaysAgo = now - 2 * 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(twoDaysAgo)).toBe('2d');
  });

  it('should handle edge case of exactly 60 seconds', () => {
    const now = Date.now();
    const sixtySecondsAgo = now - 60 * 1000;
    expect(formatRelativeTime(sixtySecondsAgo)).toBe('1m');
  });

  it('should handle edge case of exactly 60 minutes', () => {
    const now = Date.now();
    const sixtyMinutesAgo = now - 60 * 60 * 1000;
    expect(formatRelativeTime(sixtyMinutesAgo)).toBe('1h');
  });

  it('should handle edge case of exactly 24 hours', () => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    expect(formatRelativeTime(twentyFourHoursAgo)).toBe('1d');
  });
});

// ============================================
// getBatteryColor Tests
// ============================================

describe('getBatteryColor', () => {
  it('should return green for battery level > 50%', () => {
    expect(getBatteryColor(100)).toBe('#4AEDC4');
    expect(getBatteryColor(75)).toBe('#4AEDC4');
    expect(getBatteryColor(51)).toBe('#4AEDC4');
  });

  it('should return yellow for battery level 20-50%', () => {
    expect(getBatteryColor(50)).toBe('#FFAB00');
    expect(getBatteryColor(35)).toBe('#FFAB00');
    expect(getBatteryColor(21)).toBe('#FFAB00');
  });

  it('should return red for battery level < 20%', () => {
    expect(getBatteryColor(20)).toBe('#FF5252');
    expect(getBatteryColor(10)).toBe('#FF5252');
    expect(getBatteryColor(1)).toBe('#FF5252');
    expect(getBatteryColor(0)).toBe('#FF5252');
  });

  it('should handle boundary values correctly', () => {
    // Just above threshold should be green
    expect(getBatteryColor(51)).toBe('#4AEDC4');
    // At threshold should be yellow
    expect(getBatteryColor(50)).toBe('#FFAB00');
    // Just above lower threshold should be yellow
    expect(getBatteryColor(21)).toBe('#FFAB00');
    // At lower threshold should be red
    expect(getBatteryColor(20)).toBe('#FF5252');
  });
});

// ============================================
// getBatteryIcon Tests
// ============================================

describe('getBatteryIcon', () => {
  it('should return full battery icon for level > 75%', () => {
    expect(getBatteryIcon(100)).toBe('🔋');
    expect(getBatteryIcon(76)).toBe('🔋');
  });

  it('should return good battery icon for level 50-75%', () => {
    expect(getBatteryIcon(75)).toBe('🔋');
    expect(getBatteryIcon(51)).toBe('🔋');
  });

  it('should return medium battery icon for level 25-50%', () => {
    expect(getBatteryIcon(50)).toBe('🪫');
    expect(getBatteryIcon(26)).toBe('🪫');
  });

  it('should return low battery icon for level <= 25%', () => {
    expect(getBatteryIcon(25)).toBe('🪫');
    expect(getBatteryIcon(10)).toBe('🪫');
    expect(getBatteryIcon(0)).toBe('🪫');
  });
});

// ============================================
// Integration Tests
// ============================================

describe('SurvivalConnectivityIsland integration', () => {
  it('should format time and battery correctly together', () => {
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    const batteryLevel = 45;

    const time = formatRelativeTime(fiveMinutesAgo);
    const color = getBatteryColor(batteryLevel);
    const icon = getBatteryIcon(batteryLevel);

    expect(time).toBe('5m');
    expect(color).toBe('#FFAB00'); // Yellow for 45%
    expect(icon).toBe('🪫'); // Medium battery icon
  });

  it('should handle low battery scenario', () => {
    const batteryLevel = 15;
    const color = getBatteryColor(batteryLevel);
    const icon = getBatteryIcon(batteryLevel);

    expect(color).toBe('#FF5252'); // Red for low battery
    expect(icon).toBe('🪫'); // Low battery icon
  });

  it('should handle high battery scenario', () => {
    const batteryLevel = 85;
    const color = getBatteryColor(batteryLevel);
    const icon = getBatteryIcon(batteryLevel);

    expect(color).toBe('#4AEDC4'); // Green for high battery
    expect(icon).toBe('🔋'); // Full battery icon
  });
});
