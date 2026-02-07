/**
 * Property-Based Tests for PermissionStatusBar
 *
 * Feature: neighbor-yield-resilience
 * Property 21: Permission Status Visualization
 *
 * **Validates: Requirements 8.1, 8.2**
 */

import * as fc from 'fast-check';
import {
  getStatusIcon,
  shouldShowWarning,
  getReducedFunctionalityText,
  getPermissionIconConfig,
} from './PermissionStatusBar';
import { MeshPermission, PermissionState } from '../../types';

// Arbitraries for permission types and states
const permissionStateArb = fc.constantFrom<PermissionState>(
  'granted',
  'denied',
  'never_ask_again',
  'unavailable'
);

const meshPermissionArb = fc.constantFrom<MeshPermission>(
  'bluetooth',
  'location',
  'nearby_devices'
);

const deniedStateArb = fc.constantFrom<PermissionState>('denied', 'never_ask_again');
const grantedStateArb = fc.constant<PermissionState>('granted');

describe('PermissionStatusBar Property Tests', () => {
  describe('Property 21: Permission Status Visualization', () => {
    /**
     * Property 21: Permission Status Visualization
     * For any permission state (granted, denied, never_ask_again), the Permission Status UI
     * SHALL display the corresponding icon and, for denied states, show a warning with
     * reduced functionality explanation.
     *
     * **Validates: Requirements 8.1, 8.2**
     */

    it('should return checkmark icon for granted state', () => {
      fc.assert(
        fc.property(grantedStateArb, (state) => {
          const icon = getStatusIcon(state);
          return icon === '✓';
        }),
        { numRuns: 100 }
      );
    });

    it('should return X icon for denied or never_ask_again states', () => {
      fc.assert(
        fc.property(deniedStateArb, (state) => {
          const icon = getStatusIcon(state);
          return icon === '✗';
        }),
        { numRuns: 100 }
      );
    });

    it('should return dash icon for unavailable state', () => {
      fc.assert(
        fc.property(fc.constant<PermissionState>('unavailable'), (state) => {
          const icon = getStatusIcon(state);
          return icon === '—';
        }),
        { numRuns: 100 }
      );
    });

    it('should show warning for denied or never_ask_again states', () => {
      fc.assert(
        fc.property(deniedStateArb, (state) => {
          return shouldShowWarning(state) === true;
        }),
        { numRuns: 100 }
      );
    });

    it('should not show warning for granted state', () => {
      fc.assert(
        fc.property(grantedStateArb, (state) => {
          return shouldShowWarning(state) === false;
        }),
        { numRuns: 100 }
      );
    });

    it('should not show warning for unavailable state', () => {
      fc.assert(
        fc.property(fc.constant<PermissionState>('unavailable'), (state) => {
          return shouldShowWarning(state) === false;
        }),
        { numRuns: 100 }
      );
    });

    it('should return non-empty reduced functionality text for any permission', () => {
      fc.assert(
        fc.property(meshPermissionArb, (permission) => {
          const text = getReducedFunctionalityText(permission);
          return typeof text === 'string' && text.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should return valid icon config for any permission type', () => {
      fc.assert(
        fc.property(meshPermissionArb, (permission) => {
          const config = getPermissionIconConfig(permission);
          return (
            typeof config.icon === 'string' &&
            config.icon.length > 0 &&
            typeof config.label === 'string' &&
            config.label.length > 0 &&
            typeof config.grantedColor === 'string' &&
            config.grantedColor.startsWith('#') &&
            typeof config.deniedColor === 'string' &&
            config.deniedColor.startsWith('#')
          );
        }),
        { numRuns: 100 }
      );
    });

    it('should always return a status icon for any permission state', () => {
      fc.assert(
        fc.property(permissionStateArb, (state) => {
          const icon = getStatusIcon(state);
          return typeof icon === 'string' && icon.length > 0;
        }),
        { numRuns: 100 }
      );
    });

    it('should have consistent warning behavior: denied states always warn, others never warn', () => {
      fc.assert(
        fc.property(permissionStateArb, (state) => {
          const showsWarning = shouldShowWarning(state);
          const isDeniedState = state === 'denied' || state === 'never_ask_again';
          return showsWarning === isDeniedState;
        }),
        { numRuns: 100 }
      );
    });
  });
});
