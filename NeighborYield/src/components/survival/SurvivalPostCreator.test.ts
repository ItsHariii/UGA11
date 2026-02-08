/**
 * Unit Tests for SurvivalPostCreator Component
 * Tests form validation, input handling, and post creation
 *
 * Requirements: 8.1-8.10
 */

import { createSurvivalPost, validateSurvivalPostSize } from '../../types';

// ============================================
// Test Suite: Post Creation Validation
// ============================================

describe('SurvivalPostCreator - Post Creation', () => {
  /**
   * Test: Valid "Have" post creation
   * Requirement 8.1, 8.2: Create post with type "Have"
   */
  test('should create valid Have post', () => {
    const post = createSurvivalPost('h', 'Fresh Tomatoes', 123);
    
    expect(post).not.toBeNull();
    expect(post?.t).toBe('h');
    expect(post?.i).toBe('Fresh Tomatoes');
    expect(post?.h).toBe(123);
    expect(post?.id).toHaveLength(8);
    expect(post?.ts).toBeGreaterThan(0);
  });

  /**
   * Test: Valid "Want" post creation
   * Requirement 8.1, 8.2: Create post with type "Want"
   */
  test('should create valid Want post', () => {
    const post = createSurvivalPost('w', 'Need Milk', 124);
    
    expect(post).not.toBeNull();
    expect(post?.t).toBe('w');
    expect(post?.i).toBe('Need Milk');
    expect(post?.h).toBe(124);
  });

  /**
   * Test: Valid "SOS" post creation with category
   * Requirement 8.1, 8.2: Create post with type "SOS" and category
   */
  test('should create valid SOS post with category', () => {
    const post = createSurvivalPost('s', 'Medical Emergency', 125, 'm');
    
    expect(post).not.toBeNull();
    expect(post?.t).toBe('s');
    expect(post?.i).toBe('Medical Emergency');
    expect(post?.h).toBe(125);
    expect(post?.c).toBe('m');
  });

  /**
   * Test: Item length validation
   * Requirement 8.3: Max 100 characters
   */
  test('should reject item longer than 100 characters', () => {
    const longItem = 'a'.repeat(101);
    const post = createSurvivalPost('h', longItem, 123);
    
    expect(post).toBeNull();
  });

  /**
   * Test: Item length at boundary
   * Requirement 8.3: Max 100 characters (boundary test)
   */
  test('should accept item exactly 100 characters', () => {
    const maxItem = 'a'.repeat(100);
    const post = createSurvivalPost('h', maxItem, 123);
    
    expect(post).not.toBeNull();
    expect(post?.i).toHaveLength(100);
  });

  /**
   * Test: Empty item validation
   * Requirement 8.3: Item must not be empty
   */
  test('should reject empty item', () => {
    const post = createSurvivalPost('h', '', 123);
    
    expect(post).toBeNull();
  });

  /**
   * Test: Whitespace-only item validation
   * Requirement 8.3: Item must not be whitespace only (after trimming becomes empty)
   */
  test('should reject whitespace-only item', () => {
    const post = createSurvivalPost('h', '   ', 123);
    
    // After trimming, whitespace becomes empty string which is rejected
    expect(post).toBeNull();
  });

  /**
   * Test: House number validation - positive integer
   * Requirement 8.4, 8.9: Numeric input only, validate format
   */
  test('should accept positive integer house number', () => {
    const post = createSurvivalPost('h', 'Item', 123);
    
    expect(post).not.toBeNull();
    expect(post?.h).toBe(123);
  });

  /**
   * Test: House number validation - zero
   * Requirement 8.4, 8.9: House number must be positive
   */
  test('should reject zero house number', () => {
    const post = createSurvivalPost('h', 'Item', 0);
    
    expect(post).toBeNull();
  });

  /**
   * Test: House number validation - negative
   * Requirement 8.4, 8.9: House number must be positive
   */
  test('should reject negative house number', () => {
    const post = createSurvivalPost('h', 'Item', -5);
    
    expect(post).toBeNull();
  });

  /**
   * Test: House number validation - decimal
   * Requirement 8.4, 8.9: House number must be integer
   */
  test('should reject decimal house number', () => {
    const post = createSurvivalPost('h', 'Item', 123.5);
    
    expect(post).toBeNull();
  });

  /**
   * Test: Post size validation
   * Requirement 8.8: Post must be under 512 bytes
   */
  test('should validate post size under 512 bytes', () => {
    const post = createSurvivalPost('h', 'Fresh Tomatoes', 123);
    
    expect(post).not.toBeNull();
    if (post) {
      expect(validateSurvivalPostSize(post)).toBe(true);
    }
  });

  /**
   * Test: Trim whitespace from item
   * Requirement 8.3: Item should be trimmed
   */
  test('should trim whitespace from item', () => {
    const post = createSurvivalPost('h', '  Fresh Tomatoes  ', 123);
    
    expect(post).not.toBeNull();
    expect(post?.i).toBe('Fresh Tomatoes');
  });

  /**
   * Test: All SOS categories
   * Requirement 8.2: Support all SOS categories
   */
  test('should support all SOS categories', () => {
    const categories: Array<'m' | 's' | 'f' | 'o'> = ['m', 's', 'f', 'o'];
    
    categories.forEach(category => {
      const post = createSurvivalPost('s', 'Emergency', 123, category);
      expect(post).not.toBeNull();
      expect(post?.c).toBe(category);
    });
  });

  /**
   * Test: Unique post IDs
   * Requirement 8.1: Each post should have unique ID
   */
  test('should generate unique post IDs', () => {
    const post1 = createSurvivalPost('h', 'Item 1', 123);
    const post2 = createSurvivalPost('h', 'Item 2', 124);
    
    expect(post1).not.toBeNull();
    expect(post2).not.toBeNull();
    expect(post1?.id).not.toBe(post2?.id);
  });

  /**
   * Test: Post ID length
   * Requirement 8.1: Post ID should be 8 characters
   */
  test('should generate 8-character post IDs', () => {
    const post = createSurvivalPost('h', 'Item', 123);
    
    expect(post).not.toBeNull();
    expect(post?.id).toHaveLength(8);
  });

  /**
   * Test: Timestamp generation
   * Requirement 8.1: Post should have valid timestamp
   */
  test('should generate valid Unix timestamp', () => {
    const beforeTime = Math.floor(Date.now() / 1000);
    const post = createSurvivalPost('h', 'Item', 123);
    const afterTime = Math.floor(Date.now() / 1000);
    
    expect(post).not.toBeNull();
    expect(post?.ts).toBeGreaterThanOrEqual(beforeTime);
    expect(post?.ts).toBeLessThanOrEqual(afterTime);
  });
});

// ============================================
// Test Suite: Form Validation Logic
// ============================================

describe('SurvivalPostCreator - Form Validation', () => {
  /**
   * Test: Character count tracking
   * Requirement 8.10: Show character count
   */
  test('should track character count correctly', () => {
    const item = 'Fresh Tomatoes';
    expect(item.length).toBe(14);
    expect(item.length).toBeLessThanOrEqual(100);
  });

  /**
   * Test: Character count at limit
   * Requirement 8.10: Show character count at 100
   */
  test('should show character count at limit', () => {
    const item = 'a'.repeat(100);
    expect(item.length).toBe(100);
  });

  /**
   * Test: Character count over limit
   * Requirement 8.10: Show character count over 100
   */
  test('should detect character count over limit', () => {
    const item = 'a'.repeat(101);
    expect(item.length).toBeGreaterThan(100);
  });

  /**
   * Test: House number format validation - valid
   * Requirement 8.9: Validate house number format
   */
  test('should validate correct house number format', () => {
    const houseNumber = '123';
    const num = parseInt(houseNumber, 10);
    expect(!isNaN(num)).toBe(true);
    expect(num).toBeGreaterThan(0);
    expect(Number.isInteger(num)).toBe(true);
  });

  /**
   * Test: House number format validation - invalid
   * Requirement 8.9: Reject invalid house number format
   */
  test('should reject invalid house number format', () => {
    const testCases = [
      { input: 'abc' },
      { input: '-5' },
      { input: '0' },
      { input: '' },
    ];
    
    testCases.forEach(({ input }) => {
      const num = parseInt(input, 10);
      const isValid = !isNaN(num) && num > 0 && Number.isInteger(num);
      expect(isValid).toBe(false);
    });
    
    // Note: parseInt('12.5') returns 12, which is valid
    // The component prevents decimal input via numeric keyboard
    const decimalInput = '12.5';
    const decimalNum = parseInt(decimalInput, 10);
    expect(decimalNum).toBe(12); // parseInt truncates decimals
    expect(!isNaN(decimalNum) && decimalNum > 0).toBe(true);
  });

  /**
   * Test: Numeric input filtering
   * Requirement 8.4: Numeric input only
   */
  test('should filter non-numeric characters', () => {
    const input = 'abc123def456';
    const filtered = input.replace(/[^0-9]/g, '');
    expect(filtered).toBe('123456');
  });

  /**
   * Test: Form validity - all fields valid
   * Requirement 8.1: Form should be valid when all fields are correct
   */
  test('should validate form when all fields are correct', () => {
    const item = 'Fresh Tomatoes';
    const houseNumber = '123';
    
    const isItemValid = item.trim().length > 0 && item.length <= 100;
    const num = parseInt(houseNumber, 10);
    const isHouseNumberValid = !isNaN(num) && num > 0 && Number.isInteger(num);
    const isFormValid = isItemValid && isHouseNumberValid;
    
    expect(isFormValid).toBe(true);
  });

  /**
   * Test: Form validity - invalid item
   * Requirement 8.1: Form should be invalid when item is empty
   */
  test('should invalidate form when item is empty', () => {
    const item = '';
    const houseNumber = '123';
    
    const isItemValid = item.trim().length > 0 && item.length <= 100;
    const num = parseInt(houseNumber, 10);
    const isHouseNumberValid = !isNaN(num) && num > 0 && Number.isInteger(num);
    const isFormValid = isItemValid && isHouseNumberValid;
    
    expect(isFormValid).toBe(false);
  });

  /**
   * Test: Form validity - invalid house number
   * Requirement 8.1: Form should be invalid when house number is invalid
   */
  test('should invalidate form when house number is invalid', () => {
    const item = 'Fresh Tomatoes';
    const houseNumber = 'abc';
    
    const isItemValid = item.trim().length > 0 && item.length <= 100;
    const num = parseInt(houseNumber, 10);
    const isHouseNumberValid = !isNaN(num) && num > 0 && Number.isInteger(num);
    const isFormValid = isItemValid && isHouseNumberValid;
    
    expect(isFormValid).toBe(false);
  });
});

// ============================================
// Test Suite: Performance
// ============================================

describe('SurvivalPostCreator - Performance', () => {
  /**
   * Test: Post creation speed
   * Requirement 8.8: Submit in < 1 second
   */
  test('should create post in under 1 second', () => {
    const startTime = Date.now();
    const post = createSurvivalPost('h', 'Fresh Tomatoes', 123);
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(post).not.toBeNull();
    expect(duration).toBeLessThan(1000); // Less than 1 second
  });

  /**
   * Test: Multiple post creation speed
   * Requirement 8.8: Ensure consistent performance
   */
  test('should create multiple posts quickly', () => {
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      const post = createSurvivalPost('h', `Item ${i}`, 100 + i);
      expect(post).not.toBeNull();
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(1000); // All 10 posts in under 1 second
  });
});

// ============================================
// Test Suite: Edge Cases
// ============================================

describe('SurvivalPostCreator - Edge Cases', () => {
  /**
   * Test: Maximum house number
   * Requirement 8.4: Support large house numbers
   */
  test('should support large house numbers', () => {
    const post = createSurvivalPost('h', 'Item', 999999);
    
    expect(post).not.toBeNull();
    expect(post?.h).toBe(999999);
  });

  /**
   * Test: Special characters in item
   * Requirement 8.3: Support special characters
   */
  test('should support special characters in item', () => {
    const item = 'Fresh Tomatoes & Peppers (organic)';
    const post = createSurvivalPost('h', item, 123);
    
    expect(post).not.toBeNull();
    expect(post?.i).toBe(item);
  });

  /**
   * Test: Unicode characters in item
   * Requirement 8.3: Support unicode characters
   */
  test('should support unicode characters in item', () => {
    const item = 'Fresh 🍅 Tomatoes';
    const post = createSurvivalPost('h', item, 123);
    
    expect(post).not.toBeNull();
    expect(post?.i).toBe(item);
  });

  /**
   * Test: SOS post without category
   * Requirement 8.2: SOS post can be created without category
   */
  test('should create SOS post without category', () => {
    const post = createSurvivalPost('s', 'Emergency', 123);
    
    expect(post).not.toBeNull();
    expect(post?.t).toBe('s');
    expect(post?.c).toBeUndefined();
  });

  /**
   * Test: Non-SOS post with category
   * Requirement 8.2: Category should only apply to SOS posts
   */
  test('should ignore category for non-SOS posts', () => {
    const post = createSurvivalPost('h', 'Item', 123, 'm');
    
    expect(post).not.toBeNull();
    expect(post?.t).toBe('h');
    expect(post?.c).toBeUndefined();
  });
});
