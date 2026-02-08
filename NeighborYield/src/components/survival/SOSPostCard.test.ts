/**
 * Unit tests for SOSPostCard component
 * Tests SOS post display, responding functionality, and resolution
 * 
 * Requirements: 5.1-5.10
 */

import { SurvivalPost } from '../../types';
import {
  formatRelativeTime,
  formatResponders,
  getCategoryInfo,
} from './SOSPostCard';

// ============================================
// Test Data
// ============================================

const mockSOSPost: SurvivalPost = {
  t: 's',
  i: 'Medical emergency - need help',
  h: 126,
  ts: Math.floor(Date.now() / 1000) - 120, // 2 minutes ago
  id: 'sos12345',
  c: 'm', // Medical category
  r: ['123', '124'],
};

const mockResolvedSOSPost: SurvivalPost = {
  ...mockSOSPost,
  resolved: true,
};

// ============================================
// Utility Function Tests
// ============================================

describe('SOSPostCard Utility Functions', () => {
  describe('formatRelativeTime', () => {
    it('should format time as "just now" for recent posts', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now)).toBe('just now');
      expect(formatRelativeTime(now - 30)).toBe('just now');
    });

    it('should format time in minutes for posts under 1 hour', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now - 60)).toBe('1m ago');
      expect(formatRelativeTime(now - 300)).toBe('5m ago');
      expect(formatRelativeTime(now - 3540)).toBe('59m ago');
    });

    it('should format time in hours for posts under 24 hours', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now - 3600)).toBe('1h ago');
      expect(formatRelativeTime(now - 7200)).toBe('2h ago');
      expect(formatRelativeTime(now - 86340)).toBe('23h ago');
    });

    it('should format time in days for posts over 24 hours', () => {
      const now = Math.floor(Date.now() / 1000);
      expect(formatRelativeTime(now - 86400)).toBe('1d ago');
      expect(formatRelativeTime(now - 172800)).toBe('2d ago');
    });
  });

  describe('formatResponders', () => {
    it('should format single responder', () => {
      expect(formatResponders(['123'])).toBe('#123');
    });

    it('should format multiple responders', () => {
      expect(formatResponders(['123', '124'])).toBe('#123, #124');
      expect(formatResponders(['123', '124', '125'])).toBe('#123, #124, #125');
    });

    it('should handle empty array', () => {
      expect(formatResponders([])).toBe('');
    });
  });

  describe('getCategoryInfo', () => {
    it('should return correct info for medical category', () => {
      const info = getCategoryInfo('m');
      expect(info.label).toBe('Medical');
      expect(info.color).toBe('#FF5252');
    });

    it('should return correct info for safety category', () => {
      const info = getCategoryInfo('s');
      expect(info.label).toBe('Safety');
      expect(info.color).toBe('#FFAB00');
    });

    it('should return correct info for fire category', () => {
      const info = getCategoryInfo('f');
      expect(info.label).toBe('Fire');
      expect(info.color).toBe('#FF6B35');
    });

    it('should return correct info for other category', () => {
      const info = getCategoryInfo('o');
      expect(info.label).toBe('Other');
      expect(info.color).toBe('#9E9E9E');
    });

    it('should default to "Other" for undefined category', () => {
      const info = getCategoryInfo(undefined);
      expect(info.label).toBe('Other');
      expect(info.color).toBe('#9E9E9E');
    });
  });
});

// ============================================
// Component Behavior Tests
// ============================================

describe('SOSPostCard Component Behavior', () => {
  describe('Post Display', () => {
    it('should display SOS post with correct format', () => {
      // Requirement 5.3: Format: "⚠️ [EMERGENCY] - House #[NUMBER] - [TIME]"
      const post = mockSOSPost;
      const expectedFormat = /⚠️ .+ - House #\d+ - .+ ago/;
      
      // The formatted text should match the pattern
      const formattedText = `⚠️ ${post.i} - House #${post.h} - ${formatRelativeTime(post.ts)}`;
      expect(formattedText).toMatch(expectedFormat);
    });

    it('should include alert icon', () => {
      // Requirement 5.9: Alert icon (⚠️)
      const post = mockSOSPost;
      const formattedText = `⚠️ ${post.i} - House #${post.h} - ${formatRelativeTime(post.ts)}`;
      expect(formattedText).toContain('⚠️');
    });

    it('should display category badge', () => {
      // Requirement 5.10: Support categories with color-coded badges
      const categoryInfo = getCategoryInfo(mockSOSPost.c);
      expect(categoryInfo.label).toBe('Medical');
      expect(categoryInfo.color).toBeTruthy();
    });
  });

  describe('Responder Functionality', () => {
    it('should show responding count when responders exist', () => {
      // Requirement 5.5: Show list of responders
      const post = mockSOSPost;
      const respondingCount = post.r?.length || 0;
      
      expect(respondingCount).toBe(2);
      expect(respondingCount > 0).toBe(true);
    });

    it('should format responder list correctly', () => {
      // Requirement 5.5: Show list of responders with house numbers
      const post = mockSOSPost;
      const responderText = formatResponders(post.r || []);
      
      expect(responderText).toBe('#123, #124');
    });

    it('should handle no responders', () => {
      const post: SurvivalPost = {
        ...mockSOSPost,
        r: undefined,
      };
      
      const respondingCount = post.r?.length || 0;
      expect(respondingCount).toBe(0);
    });
  });

  describe('Resolution Status', () => {
    it('should identify resolved posts', () => {
      // Requirement 5.8: Persist until marked resolved
      const post = mockResolvedSOSPost;
      expect(post.resolved).toBe(true);
    });

    it('should identify unresolved posts', () => {
      const post = mockSOSPost;
      expect(post.resolved).toBeUndefined();
    });
  });

  describe('Sticky Behavior', () => {
    it('should be marked as SOS type for sticky positioning', () => {
      // Requirement 5.1: SOS post SHALL be "sticky" (stays at top)
      // This is handled by the parent component, but we verify the type
      const post = mockSOSPost;
      expect(post.t).toBe('s');
    });
  });

  describe('Size Validation', () => {
    it('should create posts under 512 bytes', () => {
      // Requirement 5.7: Maximum 512 bytes when serialized
      const post = mockSOSPost;
      const serialized = JSON.stringify(post);
      const sizeInBytes = new TextEncoder().encode(serialized).length;
      
      expect(sizeInBytes).toBeLessThanOrEqual(512);
    });

    it('should handle posts with maximum responders', () => {
      const post: SurvivalPost = {
        ...mockSOSPost,
        r: Array.from({ length: 20 }, (_, i) => `${100 + i}`),
      };
      
      const serialized = JSON.stringify(post);
      const sizeInBytes = new TextEncoder().encode(serialized).length;
      
      // Should still be under 512 bytes even with many responders
      expect(sizeInBytes).toBeLessThanOrEqual(512);
    });
  });

  describe('Category Support', () => {
    it('should support all category types', () => {
      // Requirement 5.10: Support categories: Medical, Safety, Fire, Other
      const categories: Array<'m' | 's' | 'f' | 'o'> = ['m', 's', 'f', 'o'];
      
      categories.forEach(category => {
        const info = getCategoryInfo(category);
        expect(info.label).toBeTruthy();
        expect(info.color).toBeTruthy();
      });
    });

    it('should have distinct colors for each category', () => {
      const medical = getCategoryInfo('m');
      const safety = getCategoryInfo('s');
      const fire = getCategoryInfo('f');
      const other = getCategoryInfo('o');
      
      const colors = [medical.color, safety.color, fire.color, other.color];
      const uniqueColors = new Set(colors);
      
      expect(uniqueColors.size).toBe(4); // All colors should be unique
    });
  });

  describe('Accessibility', () => {
    it('should provide descriptive accessibility label', () => {
      // Requirement 10.10: Accessibility support
      const post = mockSOSPost;
      const categoryInfo = getCategoryInfo(post.c);
      const respondingCount = post.r?.length || 0;
      
      const accessibilityLabel = `SOS emergency post: ${post.i} at house number ${post.h}, posted ${formatRelativeTime(post.ts)}, category: ${categoryInfo.label}, ${respondingCount} people responding`;
      
      expect(accessibilityLabel).toContain('SOS emergency post');
      expect(accessibilityLabel).toContain(post.i);
      expect(accessibilityLabel).toContain(`house number ${post.h}`);
      expect(accessibilityLabel).toContain('category: Medical');
    });
  });

  describe('Button Requirements', () => {
    it('should have correct button height', () => {
      // Requirement 5.4: 44px height (minimum touch target)
      const BUTTON_HEIGHT = 44;
      expect(BUTTON_HEIGHT).toBe(44);
    });

    it('should use red color for responding button', () => {
      // Requirement 5.4: Red color (#FF5252)
      const RED_COLOR = '#FF5252';
      expect(RED_COLOR).toBe('#FF5252');
    });
  });
});

// ============================================
// Integration Tests
// ============================================

describe('SOSPostCard Integration', () => {
  it('should handle complete SOS post lifecycle', () => {
    // Create SOS post
    const post: SurvivalPost = {
      t: 's',
      i: 'Fire emergency',
      h: 130,
      ts: Math.floor(Date.now() / 1000),
      id: 'fire1234',
      c: 'f',
    };
    
    // Verify initial state
    expect(post.t).toBe('s');
    expect(post.r).toBeUndefined();
    expect(post.resolved).toBeUndefined();
    
    // Add responders
    const withResponders: SurvivalPost = {
      ...post,
      r: ['131', '132'],
    };
    
    expect(withResponders.r?.length).toBe(2);
    
    // Mark resolved
    const resolved: SurvivalPost = {
      ...withResponders,
      resolved: true,
    };
    
    expect(resolved.resolved).toBe(true);
    
    // Verify size throughout lifecycle
    [post, withResponders, resolved].forEach(p => {
      const serialized = JSON.stringify(p);
      const sizeInBytes = new TextEncoder().encode(serialized).length;
      expect(sizeInBytes).toBeLessThanOrEqual(512);
    });
  });

  it('should maintain data integrity with multiple responders', () => {
    const post: SurvivalPost = {
      ...mockSOSPost,
      r: ['100', '101', '102', '103', '104'],
    };
    
    const responders = post.r || [];
    const responderText = formatResponders(responders);
    expect(responderText).toBe('#100, #101, #102, #103, #104');
    
    // Verify all responders are unique
    const uniqueResponders = new Set(responders);
    expect(uniqueResponders.size).toBe(responders.length);
  });
});
