/**
 * Unit tests for SurvivalBatteryConfig and battery threshold logic
 * 
 * Requirements: 6.1-6.10
 */

import {
  BATTERY_THRESHOLDS,
  getBatteryConfig,
} from './index';

describe('SurvivalBatteryConfig', () => {
  describe('BATTERY_THRESHOLDS', () => {
    it('should have correct HIGH threshold', () => {
      expect(BATTERY_THRESHOLDS.HIGH.min).toBe(50);
      expect(BATTERY_THRESHOLDS.HIGH.interval).toBe(15000); // 15 seconds
    });

    it('should have correct MEDIUM threshold', () => {
      expect(BATTERY_THRESHOLDS.MEDIUM.min).toBe(20);
      expect(BATTERY_THRESHOLDS.MEDIUM.interval).toBe(30000); // 30 seconds
    });

    it('should have correct LOW threshold', () => {
      expect(BATTERY_THRESHOLDS.LOW.min).toBe(0);
      expect(BATTERY_THRESHOLDS.LOW.interval).toBe(60000); // 60 seconds
    });
  });

  describe('getBatteryConfig', () => {
    describe('High battery (> 50%)', () => {
      it('should return full functionality at 100%', () => {
        const config = getBatteryConfig(100);
        expect(config.level).toBe(100);
        expect(config.discoveryInterval).toBe(15000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should return full functionality at 75%', () => {
        const config = getBatteryConfig(75);
        expect(config.level).toBe(75);
        expect(config.discoveryInterval).toBe(15000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should return full functionality at 51%', () => {
        const config = getBatteryConfig(51);
        expect(config.level).toBe(51);
        expect(config.discoveryInterval).toBe(15000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });
    });

    describe('Medium battery (20-50%)', () => {
      it('should return reduced discovery at 50%', () => {
        const config = getBatteryConfig(50);
        expect(config.level).toBe(50);
        expect(config.discoveryInterval).toBe(30000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should return reduced discovery at 35%', () => {
        const config = getBatteryConfig(35);
        expect(config.level).toBe(35);
        expect(config.discoveryInterval).toBe(30000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should return reduced discovery at 21%', () => {
        const config = getBatteryConfig(21);
        expect(config.level).toBe(21);
        expect(config.discoveryInterval).toBe(30000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });
    });

    describe('Low battery (< 20%)', () => {
      it('should enable power save mode at 20%', () => {
        const config = getBatteryConfig(20);
        expect(config.level).toBe(20);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.animationsEnabled).toBe(false);
        expect(config.powerSaveMode).toBe(true);
      });

      it('should enable power save mode at 10%', () => {
        const config = getBatteryConfig(10);
        expect(config.level).toBe(10);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.animationsEnabled).toBe(false);
        expect(config.powerSaveMode).toBe(true);
      });

      it('should enable power save mode at 5%', () => {
        const config = getBatteryConfig(5);
        expect(config.level).toBe(5);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.animationsEnabled).toBe(false);
        expect(config.powerSaveMode).toBe(true);
      });

      it('should enable power save mode at 1%', () => {
        const config = getBatteryConfig(1);
        expect(config.level).toBe(1);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.animationsEnabled).toBe(false);
        expect(config.powerSaveMode).toBe(true);
      });
    });

    describe('Edge cases', () => {
      it('should handle 0% battery', () => {
        const config = getBatteryConfig(0);
        expect(config.level).toBe(0);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.animationsEnabled).toBe(false);
        expect(config.powerSaveMode).toBe(true);
      });

      it('should clamp negative values to 0', () => {
        const config = getBatteryConfig(-10);
        expect(config.level).toBe(0);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.animationsEnabled).toBe(false);
        expect(config.powerSaveMode).toBe(true);
      });

      it('should clamp values above 100 to 100', () => {
        const config = getBatteryConfig(150);
        expect(config.level).toBe(100);
        expect(config.discoveryInterval).toBe(15000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should handle decimal battery levels', () => {
        const config = getBatteryConfig(45.7);
        expect(config.level).toBe(45.7);
        expect(config.discoveryInterval).toBe(30000);
        expect(config.animationsEnabled).toBe(true);
        expect(config.powerSaveMode).toBe(false);
      });
    });

    describe('Boundary conditions', () => {
      it('should use HIGH config at exactly 51%', () => {
        const config = getBatteryConfig(51);
        expect(config.discoveryInterval).toBe(15000);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should use MEDIUM config at exactly 50%', () => {
        const config = getBatteryConfig(50);
        expect(config.discoveryInterval).toBe(30000);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should use MEDIUM config at exactly 21%', () => {
        const config = getBatteryConfig(21);
        expect(config.discoveryInterval).toBe(30000);
        expect(config.powerSaveMode).toBe(false);
      });

      it('should use LOW config at exactly 20%', () => {
        const config = getBatteryConfig(20);
        expect(config.discoveryInterval).toBe(60000);
        expect(config.powerSaveMode).toBe(true);
        expect(config.animationsEnabled).toBe(false);
      });
    });

    describe('Discovery interval progression', () => {
      it('should increase discovery interval as battery decreases', () => {
        const high = getBatteryConfig(60);
        const medium = getBatteryConfig(40);
        const low = getBatteryConfig(15);

        expect(high.discoveryInterval).toBeLessThan(medium.discoveryInterval);
        expect(medium.discoveryInterval).toBeLessThan(low.discoveryInterval);
      });

      it('should have 2x interval from HIGH to MEDIUM', () => {
        const high = getBatteryConfig(60);
        const medium = getBatteryConfig(40);

        expect(medium.discoveryInterval).toBe(high.discoveryInterval * 2);
      });

      it('should have 4x interval from HIGH to LOW', () => {
        const high = getBatteryConfig(60);
        const low = getBatteryConfig(15);

        expect(low.discoveryInterval).toBe(high.discoveryInterval * 4);
      });
    });

    describe('Power save mode activation', () => {
      it('should not activate power save mode above 20%', () => {
        expect(getBatteryConfig(100).powerSaveMode).toBe(false);
        expect(getBatteryConfig(50).powerSaveMode).toBe(false);
        expect(getBatteryConfig(21).powerSaveMode).toBe(false);
      });

      it('should activate power save mode at or below 20%', () => {
        expect(getBatteryConfig(20).powerSaveMode).toBe(true);
        expect(getBatteryConfig(10).powerSaveMode).toBe(true);
        expect(getBatteryConfig(5).powerSaveMode).toBe(true);
        expect(getBatteryConfig(0).powerSaveMode).toBe(true);
      });
    });

    describe('Animation control', () => {
      it('should enable animations above 20%', () => {
        expect(getBatteryConfig(100).animationsEnabled).toBe(true);
        expect(getBatteryConfig(50).animationsEnabled).toBe(true);
        expect(getBatteryConfig(21).animationsEnabled).toBe(true);
      });

      it('should disable animations at or below 20%', () => {
        expect(getBatteryConfig(20).animationsEnabled).toBe(false);
        expect(getBatteryConfig(10).animationsEnabled).toBe(false);
        expect(getBatteryConfig(5).animationsEnabled).toBe(false);
        expect(getBatteryConfig(0).animationsEnabled).toBe(false);
      });
    });

    describe('Requirements validation', () => {
      it('should meet Requirement 6.2 - discovery intervals', () => {
        // > 50%: 15 second interval
        const high = getBatteryConfig(60);
        expect(high.discoveryInterval).toBe(15000);

        // 20-50%: 30 second interval
        const medium = getBatteryConfig(35);
        expect(medium.discoveryInterval).toBe(30000);

        // < 20%: 60 second interval
        const low = getBatteryConfig(15);
        expect(low.discoveryInterval).toBe(60000);
      });

      it('should meet Requirement 6.3 - disable animations when battery < 20%', () => {
        const above20 = getBatteryConfig(21);
        const at20 = getBatteryConfig(20);
        const below20 = getBatteryConfig(19);

        expect(above20.animationsEnabled).toBe(true);
        expect(at20.animationsEnabled).toBe(false);
        expect(below20.animationsEnabled).toBe(false);
      });

      it('should meet Requirement 6.4 - power save mode configuration', () => {
        const config = getBatteryConfig(15);
        expect(config.powerSaveMode).toBe(true);
        expect(config.animationsEnabled).toBe(false);
        expect(config.discoveryInterval).toBe(60000);
      });
    });
  });

  describe('Type validation', () => {
    it('should return correct SurvivalBatteryConfig structure', () => {
      const config = getBatteryConfig(50);
      
      expect(config).toHaveProperty('level');
      expect(config).toHaveProperty('discoveryInterval');
      expect(config).toHaveProperty('animationsEnabled');
      expect(config).toHaveProperty('powerSaveMode');

      expect(typeof config.level).toBe('number');
      expect(typeof config.discoveryInterval).toBe('number');
      expect(typeof config.animationsEnabled).toBe('boolean');
      expect(typeof config.powerSaveMode).toBe('boolean');
    });
  });
});
