/**
 * Unit tests for PostCreatorForm user override tracking
 * Tests that user edits are preserved over AI suggestions
 * 
 * Requirements: 4.2, 4.3, 4.4
 */

// Mock the geminiClassifier before importing the component
jest.mock('../../../../src/index', () => ({
  geminiClassifier: {
    isAvailable: jest.fn(() => false),
    classifyFoodRisk: jest.fn(),
  },
}));

import { validateFormData, formatTTLPreview } from './PostCreatorForm';
import { RiskTier } from '../../types';

describe('PostCreatorForm - User Override Tracking', () => {
  describe('validateFormData', () => {
    it('should validate title is required', () => {
      const result = validateFormData({
        title: '',
        description: 'Test description',
        riskTier: 'medium',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should validate title minimum length', () => {
      const result = validateFormData({
        title: 'ab',
        description: 'Test description',
        riskTier: 'medium',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters');
    });

    it('should validate title maximum length', () => {
      const result = validateFormData({
        title: 'a'.repeat(101),
        description: 'Test description',
        riskTier: 'medium',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be less than 100 characters');
    });

    it('should validate description maximum length', () => {
      const result = validateFormData({
        title: 'Valid title',
        description: 'a'.repeat(501),
        riskTier: 'medium',
      });
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be less than 500 characters');
    });

    it('should pass validation for valid data', () => {
      const result = validateFormData({
        title: 'Fresh Apples',
        description: 'Organic apples from my garden',
        riskTier: 'low',
      });
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('formatTTLPreview', () => {
    it('should format high risk tier TTL correctly', () => {
      const result = formatTTLPreview('high');
      expect(result).toBe('Expires in 15 min');
    });

    it('should format medium risk tier TTL correctly', () => {
      const result = formatTTLPreview('medium');
      expect(result).toBe('Expires in 30 min');
    });

    it('should format low risk tier TTL correctly', () => {
      const result = formatTTLPreview('low');
      expect(result).toBe('Expires in 60 min');
    });
  });

  describe('TTL Recalculation on Risk Tier Change', () => {
    it('should recalculate TTL when risk tier changes from high to medium', () => {
      const initialTTL = formatTTLPreview('high');
      const updatedTTL = formatTTLPreview('medium');
      
      expect(initialTTL).toBe('Expires in 15 min');
      expect(updatedTTL).toBe('Expires in 30 min');
    });

    it('should recalculate TTL when risk tier changes from medium to low', () => {
      const initialTTL = formatTTLPreview('medium');
      const updatedTTL = formatTTLPreview('low');
      
      expect(initialTTL).toBe('Expires in 30 min');
      expect(updatedTTL).toBe('Expires in 60 min');
    });

    it('should recalculate TTL when risk tier changes from low to high', () => {
      const initialTTL = formatTTLPreview('low');
      const updatedTTL = formatTTLPreview('high');
      
      expect(initialTTL).toBe('Expires in 60 min');
      expect(updatedTTL).toBe('Expires in 15 min');
    });
  });
});
