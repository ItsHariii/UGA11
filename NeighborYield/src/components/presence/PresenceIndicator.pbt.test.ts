/**
 * Property-Based Tests for PresenceIndicator
 *
 * Feature: neighbor-yield-resilience
 * Property 11: Peer Count Display Format
 *
 * **Validates: Requirements 3.6, 4.2**
 */

import * as fc from 'fast-check';
import { formatPeerCountDisplay } from './PresenceIndicator';

describe('PresenceIndicator Property Tests', () => {
  describe('Property 11: Peer Count Display Format', () => {
    /**
     * Property 11: Peer Count Display Format
     * For any peer count N >= 1, the UI SHALL display the string "N neighbors in range"
     * where N is the exact count. For N = 0, the UI SHALL display "No neighbors in range".
     *
     * **Validates: Requirements 3.6, 4.2**
     */
    it('should display "No neighbors in range" when count is 0', () => {
      fc.assert(
        fc.property(fc.constant(0), count => {
          const result = formatPeerCountDisplay(count);
          return result === 'No neighbors in range';
        }),
        { numRuns: 100 },
      );
    });

    it('should display "1 neighbor in range" when count is 1', () => {
      fc.assert(
        fc.property(fc.constant(1), count => {
          const result = formatPeerCountDisplay(count);
          return result === '1 neighbor in range';
        }),
        { numRuns: 100 },
      );
    });

    it('should display "N neighbors in range" for any count N >= 2', () => {
      fc.assert(
        fc.property(fc.integer({ min: 2, max: 1000 }), count => {
          const result = formatPeerCountDisplay(count);
          return result === `${count} neighbors in range`;
        }),
        { numRuns: 100 },
      );
    });

    it('should always contain the exact count in the display string for N >= 1', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10000 }), count => {
          const result = formatPeerCountDisplay(count);
          // The result should contain the count as a substring
          return result.includes(count.toString());
        }),
        { numRuns: 100 },
      );
    });

    it('should always end with "in range" for any valid count', () => {
      fc.assert(
        fc.property(fc.integer({ min: 0, max: 10000 }), count => {
          const result = formatPeerCountDisplay(count);
          return result.endsWith('in range');
        }),
        { numRuns: 100 },
      );
    });

    it('should use singular "neighbor" for count of 1 and plural "neighbors" for count > 1', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 10000 }), count => {
          const result = formatPeerCountDisplay(count);
          if (count === 1) {
            return result.includes('neighbor') && !result.includes('neighbors');
          } else {
            return result.includes('neighbors');
          }
        }),
        { numRuns: 100 },
      );
    });
  });
});
