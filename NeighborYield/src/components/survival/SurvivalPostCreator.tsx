/**
 * SurvivalPostCreator Component
 * Simplified form for creating posts quickly in survival mode
 * 3-field form: Type, Item, House Number
 *
 * Requirements: 8.1-8.10 (Simplified Post Creation)
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { SurvivalPost, createSurvivalPost } from '../../types';

// ============================================
// Types and Interfaces
// ============================================

export interface SurvivalPostCreatorProps {
  /** Callback when post is submitted */
  onSubmit: (post: SurvivalPost) => void;
  /** Callback when creation is cancelled */
  onCancel: () => void;
  /** User's house number (pre-filled) */
  userHouseNumber?: number;
  /** Test ID for testing */
  testID?: string;
}

type PostType = 'h' | 'w' | 's';
type SOSCategory = 'm' | 's' | 'f' | 'o';

interface TypeOption {
  value: PostType;
  label: string;
}

interface SOSCategoryOption {
  value: SOSCategory;
  label: string;
}

// ============================================
// Constants
// ============================================

const MAX_ITEM_LENGTH = 100; // Requirement 8.3: Max 100 characters
const BUTTON_HEIGHT = 48; // Requirement 8.6: 48px height

const TYPE_OPTIONS: TypeOption[] = [
  { value: 'h', label: 'Have' },
  { value: 'w', label: 'Want' },
  { value: 's', label: 'SOS' },
];

const SOS_CATEGORIES: SOSCategoryOption[] = [
  { value: 'm', label: 'Medical' },
  { value: 's', label: 'Safety' },
  { value: 'f', label: 'Fire' },
  { value: 'o', label: 'Other' },
];

// ============================================
// SurvivalPostCreator Component
// ============================================

function SurvivalPostCreatorComponent({
  onSubmit,
  onCancel,
  userHouseNumber = 0,
  testID = 'survival-post-creator',
}: SurvivalPostCreatorProps): React.JSX.Element {
  const { tokens } = useTheme();
  const { colors, spacing } = tokens;

  // Form state
  // Requirement 8.2: Default to "Have"
  const [postType, setPostType] = useState<PostType>('h');
  const [item, setItem] = useState<string>('');
  const [houseNumber, setHouseNumber] = useState<string>(
    userHouseNumber > 0 ? userHouseNumber.toString() : ''
  );
  const [sosCategory, setSOSCategory] = useState<SOSCategory>('m');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // Validation
  const isItemValid = item.trim().length > 0 && item.length <= MAX_ITEM_LENGTH;
  const isHouseNumberValid = useMemo(() => {
    const num = parseInt(houseNumber, 10);
    return !isNaN(num) && num > 0 && Number.isInteger(num);
  }, [houseNumber]);
  const isFormValid = isItemValid && isHouseNumberValid;

  // Character count for item
  // Requirement 8.10: Show character count
  const characterCount = item.length;
  const characterCountColor = characterCount > MAX_ITEM_LENGTH ? colors.accentDanger : colors.textMuted;

  // Get selected type label
  const selectedTypeLabel = TYPE_OPTIONS.find(opt => opt.value === postType)?.label || 'Have';
  const selectedCategoryLabel = SOS_CATEGORIES.find(opt => opt.value === sosCategory)?.label || 'Medical';

  // Handle type selection
  const handleTypeSelect = useCallback((type: PostType) => {
    setPostType(type);
    setShowTypeDropdown(false);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((category: SOSCategory) => {
    setSOSCategory(category);
    setShowCategoryDropdown(false);
  }, []);

  // Handle house number input
  // Requirement 8.4: Numeric input only
  const handleHouseNumberChange = useCallback((text: string) => {
    // Only allow numeric input
    const numericText = text.replace(/[^0-9]/g, '');
    setHouseNumber(numericText);
  }, []);

  // Handle submit
  // Requirement 8.8: Submit in < 1 second
  const handleSubmit = useCallback(() => {
    if (!isFormValid) {
      return;
    }

    const houseNum = parseInt(houseNumber, 10);
    const category = postType === 's' ? sosCategory : undefined;
    
    // Create post using utility function
    const post = createSurvivalPost(postType, item.trim(), houseNum, category);
    
    if (post) {
      onSubmit(post);
    }
  }, [isFormValid, postType, item, houseNumber, sosCategory, onSubmit]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}
      testID={testID}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Create Post
          </Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          {/* Type Dropdown */}
          {/* Requirement 8.2: Dropdown with options: Have, Want, SOS */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Type
            </Text>
            <Pressable
              style={[
                styles.dropdown,
                { backgroundColor: colors.backgroundCard, borderColor: colors.borderDefault },
              ]}
              onPress={() => setShowTypeDropdown(true)}
              accessibilityRole="button"
              accessibilityLabel={`Post type: ${selectedTypeLabel}`}
              accessibilityHint="Tap to select post type"
              testID={`${testID}-type-dropdown`}
            >
              <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>
                {selectedTypeLabel}
              </Text>
              <Text style={[styles.dropdownArrow, { color: colors.textMuted }]}>▼</Text>
            </Pressable>
          </View>

          {/* SOS Category (only shown for SOS posts) */}
          {postType === 's' && (
            <View style={styles.fieldContainer}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Category
              </Text>
              <Pressable
                style={[
                  styles.dropdown,
                  { backgroundColor: colors.backgroundCard, borderColor: colors.borderDefault },
                ]}
                onPress={() => setShowCategoryDropdown(true)}
                accessibilityRole="button"
                accessibilityLabel={`SOS category: ${selectedCategoryLabel}`}
                accessibilityHint="Tap to select SOS category"
                testID={`${testID}-category-dropdown`}
              >
                <Text style={[styles.dropdownText, { color: colors.textPrimary }]}>
                  {selectedCategoryLabel}
                </Text>
                <Text style={[styles.dropdownArrow, { color: colors.textMuted }]}>▼</Text>
              </Pressable>
            </View>
          )}

          {/* Item Input */}
          {/* Requirement 8.3: Single-line text input, max 100 chars */}
          <View style={styles.fieldContainer}>
            <View style={styles.labelRow}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Item
              </Text>
              {/* Requirement 8.10: Show character count */}
              <Text style={[styles.characterCount, { color: characterCountColor }]}>
                {characterCount}/{MAX_ITEM_LENGTH}
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.borderDefault,
                  color: colors.textPrimary,
                },
              ]}
              value={item}
              onChangeText={setItem}
              placeholder="What are you sharing or need?"
              placeholderTextColor={colors.textMuted}
              maxLength={MAX_ITEM_LENGTH}
              autoCapitalize="sentences"
              autoCorrect={true}
              accessibilityLabel="Item description"
              accessibilityHint="Enter what you have or need"
              testID={`${testID}-item-input`}
            />
          </View>

          {/* House Number Input */}
          {/* Requirement 8.4: Numeric input only */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              House Number
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.borderDefault,
                  color: colors.textPrimary,
                },
              ]}
              value={houseNumber}
              onChangeText={handleHouseNumberChange}
              placeholder="123"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              accessibilityLabel="House number"
              accessibilityHint="Enter your house number"
              testID={`${testID}-house-number-input`}
            />
            {/* Requirement 8.9: Validate format */}
            {houseNumber.length > 0 && !isHouseNumberValid && (
              <Text style={[styles.errorText, { color: colors.accentDanger }]}>
                Please enter a valid house number
              </Text>
            )}
          </View>
        </View>

        {/* Buttons */}
        {/* Requirement 8.6: Submit and Cancel buttons */}
        <View style={styles.buttonContainer}>
          {/* Submit Button */}
          {/* Requirement 8.6: Green (#4AEDC4), 48px height */}
          <Pressable
            style={[
              styles.button,
              styles.submitButton,
              {
                backgroundColor: isFormValid ? colors.accentPrimary : colors.borderDefault,
                height: BUTTON_HEIGHT,
              },
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            accessibilityRole="button"
            accessibilityLabel="Submit post"
            accessibilityHint="Create and share this post"
            accessibilityState={{ disabled: !isFormValid }}
            testID={`${testID}-submit-button`}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isFormValid ? colors.backgroundPrimary : colors.textMuted },
              ]}
            >
              Submit
            </Text>
          </Pressable>

          {/* Cancel Button */}
          {/* Requirement 8.6: Gray, 48px height */}
          <Pressable
            style={[
              styles.button,
              styles.cancelButton,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.borderDefault,
                height: BUTTON_HEIGHT,
              },
            ]}
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Cancel"
            accessibilityHint="Discard this post"
            testID={`${testID}-cancel-button`}
          >
            <Text style={[styles.buttonText, { color: colors.textSecondary }]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Type Dropdown Modal */}
      <Modal
        visible={showTypeDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTypeDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTypeDropdown(false)}
        >
          <View
            style={[
              styles.dropdownModal,
              { backgroundColor: colors.backgroundCard, borderColor: colors.borderDefault },
            ]}
          >
            {TYPE_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.dropdownOption,
                  postType === option.value && { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => handleTypeSelect(option.value)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                testID={`${testID}-type-option-${option.value}`}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    {
                      color: postType === option.value ? colors.accentPrimary : colors.textPrimary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Category Dropdown Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowCategoryDropdown(false)}
        >
          <View
            style={[
              styles.dropdownModal,
              { backgroundColor: colors.backgroundCard, borderColor: colors.borderDefault },
            ]}
          >
            {SOS_CATEGORIES.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.dropdownOption,
                  sosCategory === option.value && { backgroundColor: colors.backgroundSecondary },
                ]}
                onPress={() => handleCategorySelect(option.value)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                testID={`${testID}-category-option-${option.value}`}
              >
                <Text
                  style={[
                    styles.dropdownOptionText,
                    {
                      color: sosCategory === option.value ? colors.accentPrimary : colors.textPrimary,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'System',
  },
  form: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'System',
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    fontFamily: 'System',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'System',
  },
  dropdown: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'System',
  },
  dropdownArrow: {
    fontSize: 12,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'System',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    // Height set dynamically
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownOptionText: {
    fontSize: 16,
    fontFamily: 'System',
  },
});

// ============================================
// Memoized Export
// ============================================

export const SurvivalPostCreator = React.memo(SurvivalPostCreatorComponent);
SurvivalPostCreator.displayName = 'SurvivalPostCreator';

export default SurvivalPostCreator;
