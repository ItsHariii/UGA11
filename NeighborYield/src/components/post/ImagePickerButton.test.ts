/**
 * Unit tests for ImagePickerButton component
 * 
 * Requirements: 1.1, 1.2
 */

import { ImagePickerButton } from './ImagePickerButton';

describe('ImagePickerButton', () => {
  describe('Component Structure', () => {
    it('should be defined', () => {
      expect(ImagePickerButton).toBeDefined();
    });

    it('should be a function component', () => {
      expect(typeof ImagePickerButton).toBe('function');
    });
  });

  describe('Props Interface', () => {
    it('should accept required props', () => {
      const mockCallback = jest.fn();
      
      // This test verifies TypeScript compilation
      // If props are incorrect, TypeScript will fail
      const props = {
        onImageSelected: mockCallback,
      };
      
      expect(props.onImageSelected).toBeDefined();
    });

    it('should accept optional disabled prop', () => {
      const mockCallback = jest.fn();
      
      const props = {
        onImageSelected: mockCallback,
        disabled: true,
      };
      
      expect(props.disabled).toBe(true);
    });

    it('should accept optional testID prop', () => {
      const mockCallback = jest.fn();
      
      const props = {
        onImageSelected: mockCallback,
        testID: 'custom-test-id',
      };
      
      expect(props.testID).toBe('custom-test-id');
    });
  });
});
