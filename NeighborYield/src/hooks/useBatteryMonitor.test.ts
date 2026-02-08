/**
 * Battery Monitor Hook Tests
 * 
 * Tests battery configuration logic and thresholds
 * Requirements: 6.1-6.10
 */

import { getBatteryConfig, getBatteryColor, getBatteryIcon, BATTERY_THRESHOLDS } from './useBatteryMonitor';

describe('useBatteryMonitor', () => {
  describe('getBatteryConfig', () => {
    it('should return high performance config when battery > 50%', () => {
      const config = getBatteryConfig(75, false);
      
      expect(config.level).toBe(75);
      expect(config.discoveryInterval).toBe(BATTERY_THRESHOLDS.HIGH.interval);
      expect(config.animationsEnabled).toBe(true);
      expect(config.powerSaveMode).toBe(false);
      expect(config.isCharging).toBe(false);
    });

    it('should return medium performance config when battery 20-50%', () => {
      const config = getBatteryConfig(35, false);
      
      expect(config.level).toBe(35);
      expect(config.discoveryInterval).toBe(BATTERY_THRESHOLDS.MEDIUM.interval);
      expect(config.animationsEnabled).toBe(true);
      expect(config.powerSaveMode).toBe(false);
    });

    it('should return low performance config when battery < 20%', () => {
      const config = getBatteryConfig(15, false);
      
      expect(config.level).toBe(15);
      expect(config.discoveryInterval).toBe(BATTERY_THRESHOLDS.LOW.interval);
      expect(config.animationsEnabled).toBe(false);
      expect(config.powerSaveMode).toBe(true);
    });

    it('should use high performance config when charging regardless of level', () => {
      const config = getBatteryConfig(10, true);
      
      expect(config.discoveryInterval).toBe(BATTERY_THRESHOLDS.HIGH.interval);
      expect(config.animationsEnabled).toBe(true);
      expect(config.powerSaveMode).toBe(false);
      expect(config.isCharging).toBe(true);
    });

    it('should handle boundary values correctly', () => {
      // Exactly 50%
      const config50 = getBatteryConfig(50, false);
      expect(config50.discoveryInterval).toBe(BATTERY_THRESHOLDS.MEDIUM.interval);

      // Exactly 20%
      const config20 = getBatteryConfig(20, false);
      expect(config20.discoveryInterval).toBe(BATTERY_THRESHOLDS.MEDIUM.interval);

      // Just below 20%
      const config19 = getBatteryConfig(19, false);
      expect(config19.discoveryInterval).toBe(BATTERY_THRESHOLDS.LOW.interval);
      expect(config19.powerSaveMode).toBe(true);
    });

    it('should handle extreme values', () => {
      const config0 = getBatteryConfig(0, false);
      expect(config0.powerSaveMode).toBe(true);
      expect(config0.animationsEnabled).toBe(false);

      const config100 = getBatteryConfig(100, false);
      expect(config100.powerSaveMode).toBe(false);
      expect(config100.animationsEnabled).toBe(true);
    });
  });

  describe('getBatteryColor', () => {
    it('should return green for battery > 50%', () => {
      expect(getBatteryColor(75)).toBe('#4AEDC4');
      expect(getBatteryColor(51)).toBe('#4AEDC4');
    });

    it('should return yellow for battery 20-50%', () => {
      expect(getBatteryColor(35)).toBe('#FFAB00');
      expect(getBatteryColor(21)).toBe('#FFAB00');
    });

    it('should return red for battery <= 20%', () => {
      expect(getBatteryColor(20)).toBe('#FF5252');
      expect(getBatteryColor(10)).toBe('#FF5252');
      expect(getBatteryColor(0)).toBe('#FF5252');
    });
  });

  describe('getBatteryIcon', () => {
    it('should return charging icon when charging', () => {
      expect(getBatteryIcon(50, true)).toBe('⚡');
      expect(getBatteryIcon(10, true)).toBe('⚡');
    });

    it('should return full battery icon for high levels', () => {
      expect(getBatteryIcon(100, false)).toBe('🔋');
      expect(getBatteryIcon(76, false)).toBe('🔋');
    });

    it('should return low battery icon for low levels', () => {
      expect(getBatteryIcon(25, false)).toBe('🪫');
      expect(getBatteryIcon(10, false)).toBe('🪫');
    });
  });

  describe('BATTERY_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(BATTERY_THRESHOLDS.HIGH.min).toBe(50);
      expect(BATTERY_THRESHOLDS.HIGH.interval).toBe(15000);

      expect(BATTERY_THRESHOLDS.MEDIUM.min).toBe(20);
      expect(BATTERY_THRESHOLDS.MEDIUM.interval).toBe(30000);

      expect(BATTERY_THRESHOLDS.LOW.min).toBe(0);
      expect(BATTERY_THRESHOLDS.LOW.interval).toBe(60000);
    });

    it('should have increasing intervals as battery decreases', () => {
      expect(BATTERY_THRESHOLDS.HIGH.interval).toBeLessThan(BATTERY_THRESHOLDS.MEDIUM.interval);
      expect(BATTERY_THRESHOLDS.MEDIUM.interval).toBeLessThan(BATTERY_THRESHOLDS.LOW.interval);
    });
  });
});

describe('Battery Configuration Property Tests', () => {
  it('discovery interval should increase as battery decreases', () => {
    // Test multiple battery levels
    const levels = [100, 75, 50, 35, 20, 15, 10, 5, 0];
    const intervals = levels.map(level => getBatteryConfig(level, false).discoveryInterval);

    // Check that intervals are non-decreasing as battery decreases
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
  });

  it('power save mode should only activate below 20%', () => {
    for (let level = 0; level <= 100; level += 5) {
      const config = getBatteryConfig(level, false);
      if (level < 20) {
        expect(config.powerSaveMode).toBe(true);
      } else {
        expect(config.powerSaveMode).toBe(false);
      }
    }
  });

  it('animations should be disabled only when battery < 20%', () => {
    for (let level = 0; level <= 100; level += 5) {
      const config = getBatteryConfig(level, false);
      if (level < 20) {
        expect(config.animationsEnabled).toBe(false);
      } else {
        expect(config.animationsEnabled).toBe(true);
      }
    }
  });

  it('charging should override all power save settings', () => {
    for (let level = 0; level <= 100; level += 10) {
      const config = getBatteryConfig(level, true);
      expect(config.isCharging).toBe(true);
      expect(config.powerSaveMode).toBe(false);
      expect(config.animationsEnabled).toBe(true);
      expect(config.discoveryInterval).toBe(BATTERY_THRESHOLDS.HIGH.interval);
    }
  });
});
