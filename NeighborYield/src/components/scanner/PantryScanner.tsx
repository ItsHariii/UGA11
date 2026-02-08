/**
 * PantryScanner Component
 * A dual-mode pantry scanner interface that adapts to connectivity mode.
 * - Abundance mode: Camera viewfinder with decorative overlays
 * - Survival mode: Minimal viewfinder with high-contrast guides, camera disabled
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Animated,
  Easing,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Camera,
  ScanLine,
  Package,
  X,
  Check,
  Edit3,
  AlertTriangle,
  Barcode,
} from 'lucide-react-native';
import { ThemeMode } from '../../theme/ThemeContext';
import { DesignTokens, abundanceDesignTokens, survivalDesignTokens } from '../../theme/tokens';
import { SharePost, RiskTier } from '../../types';
import { abundanceModeConfig, survivalModeConfig } from '../feed/DualModeFeedCard';

// ============================================
// Types and Interfaces
// ============================================

export type ScannerView = 'camera' | 'manual' | 'results';

export interface ScanResult {
  barcode: string;
  productName?: string;
  category?: string;
  timestamp: number;
}

export interface PantryScannerProps {
  /** Current theme mode */
  mode: ThemeMode;
  /** Whether the scanner is active */
  isActive?: boolean;
  /** Callback when a scan is completed */
  onScanComplete?: (result: ScanResult) => void;
  /** Callback when manual entry is submitted */
  onManualEntry?: (data: ManualEntryData) => void;
  /** Callback when scanner is closed */
  onClose?: () => void;
  /** Scanned results to display */
  scanResults?: ScanResult[];
  /** Test ID for testing */
  testID?: string;
}

export interface ManualEntryData {
  productName: string;
  category: string;
  quantity: number;
  notes?: string;
}

export interface ViewfinderConfig {
  cornerRadius: number;
  borderWidth: number;
  showDecorations: boolean;
  showScanLine: boolean;
  guideOpacity: number;
}

// ============================================
// Mode Configuration
// ============================================

export const abundanceViewfinderConfig: ViewfinderConfig = {
  cornerRadius: 16,
  borderWidth: 3,
  showDecorations: true,
  showScanLine: true,
  guideOpacity: 0.6,
};

export const survivalViewfinderConfig: ViewfinderConfig = {
  cornerRadius: 2,
  borderWidth: 2,
  showDecorations: false,
  showScanLine: false,
  guideOpacity: 1.0,
};

/**
 * Get viewfinder configuration based on theme mode
 */
export function getViewfinderConfig(mode: ThemeMode): ViewfinderConfig {
  return mode === 'survival' ? survivalViewfinderConfig : abundanceViewfinderConfig;
}

/**
 * Get design tokens based on theme mode
 */
export function getTokensForMode(mode: ThemeMode): DesignTokens {
  return mode === 'survival' ? survivalDesignTokens : abundanceDesignTokens;
}

/**
 * Check if camera should be active based on mode
 * Requirements: 7.4 - Disable camera preview in survival mode
 */
export function shouldCameraBeActive(mode: ThemeMode, isActive: boolean): boolean {
  if (mode === 'survival') {
    return false; // Camera disabled in survival mode for battery conservation
  }
  return isActive;
}

/**
 * Convert ScanResult to SharePost format for DualModeFeedCard display
 * Requirements: 7.3 - Display scan results using Feed_Card styling
 */
export function scanResultToSharePost(result: ScanResult): SharePost {
  return {
    id: result.barcode,
    authorId: 'scanner',
    authorIdentifier: 'Pantry Scanner',
    title: result.productName || 'Unknown Product',
    description: result.category ? `Category: ${result.category}` : 'Scanned item from pantry',
    riskTier: 'low' as RiskTier,
    createdAt: result.timestamp,
    expiresAt: result.timestamp + 24 * 60 * 60 * 1000, // 24 hours
    source: 'local',
  };
}

// ============================================
// Viewfinder Component
// Requirements: 7.1, 7.2
// ============================================

interface ViewfinderProps {
  mode: ThemeMode;
  tokens: DesignTokens;
  config: ViewfinderConfig;
  isCameraActive: boolean;
  scanLineAnim: Animated.Value;
}

function Viewfinder({
  mode,
  tokens,
  config,
  isCameraActive,
  scanLineAnim,
}: ViewfinderProps): React.JSX.Element {
  const viewfinderSize = 280;
  const cornerSize = 40;

  const cornerStyle = {
    position: 'absolute' as const,
    width: cornerSize,
    height: cornerSize,
    borderColor: tokens.colors.accentPrimary,
    borderWidth: config.borderWidth,
  };

  return (
    <View
      style={[
        styles.viewfinder,
        {
          width: viewfinderSize,
          height: viewfinderSize,
          borderRadius: config.cornerRadius,
        },
      ]}
      testID="pantry-scanner-viewfinder">
      {/* Camera placeholder or disabled state */}
      <View
        style={[
          styles.cameraPlaceholder,
          {
            backgroundColor: isCameraActive ? 'transparent' : tokens.colors.backgroundSecondary,
            borderRadius: config.cornerRadius,
          },
        ]}>
        {!isCameraActive && (
          <View style={styles.cameraDisabledContent}>
            <Camera size={48} color={tokens.colors.textMuted} strokeWidth={1.5} />
            <Text style={[styles.cameraDisabledText, { color: tokens.colors.textMuted }]}>
              {mode === 'survival' ? 'Camera disabled to save battery' : 'Camera preview'}
            </Text>
          </View>
        )}
      </View>

      {/* Corner guides */}
      <View
        style={[cornerStyle, styles.cornerTopLeft, { borderBottomWidth: 0, borderRightWidth: 0 }]}
      />
      <View
        style={[cornerStyle, styles.cornerTopRight, { borderBottomWidth: 0, borderLeftWidth: 0 }]}
      />
      <View
        style={[cornerStyle, styles.cornerBottomLeft, { borderTopWidth: 0, borderRightWidth: 0 }]}
      />
      <View
        style={[cornerStyle, styles.cornerBottomRight, { borderTopWidth: 0, borderLeftWidth: 0 }]}
      />

      {/* Scan line animation (abundance mode only) */}
      {config.showScanLine && isCameraActive && (
        <Animated.View
          style={[
            styles.scanLine,
            {
              backgroundColor: tokens.colors.accentPrimary,
              opacity: config.guideOpacity,
              transform: [
                {
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, viewfinderSize - 4],
                  }),
                },
              ],
            },
          ]}
        />
      )}

      {/* Decorative overlays (abundance mode only) */}
      {config.showDecorations && (
        <>
          <View
            style={[
              styles.decorativeOverlay,
              styles.decorativeTop,
              { backgroundColor: tokens.colors.accentSecondary },
            ]}
          />
          <View
            style={[
              styles.decorativeOverlay,
              styles.decorativeBottom,
              { backgroundColor: tokens.colors.accentSecondary },
            ]}
          />
        </>
      )}

      {/* High-contrast center guide (survival mode) */}
      {mode === 'survival' && (
        <View style={styles.survivalGuide}>
          <View
            style={[styles.survivalGuideLine, { backgroundColor: tokens.colors.accentPrimary }]}
          />
          <Barcode size={24} color={tokens.colors.accentPrimary} strokeWidth={2} />
          <View
            style={[styles.survivalGuideLine, { backgroundColor: tokens.colors.accentPrimary }]}
          />
        </View>
      )}
    </View>
  );
}

// ============================================
// Manual Entry Form Component
// Requirements: 7.5
// ============================================

interface ManualEntryFormProps {
  mode: ThemeMode;
  tokens: DesignTokens;
  onSubmit: (data: ManualEntryData) => void;
  onCancel: () => void;
}

function ManualEntryForm({
  mode,
  tokens,
  onSubmit,
  onCancel,
}: ManualEntryFormProps): React.JSX.Element {
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');

  const handleSubmit = useCallback(() => {
    if (!productName.trim()) return;

    onSubmit({
      productName: productName.trim(),
      category: category.trim() || 'Other',
      quantity: parseInt(quantity, 10) || 1,
      notes: notes.trim() || undefined,
    });
  }, [productName, category, quantity, notes, onSubmit]);

  const inputStyle = useMemo(
    () => ({
      backgroundColor: tokens.colors.backgroundCard,
      borderColor: tokens.colors.borderDefault,
      color: tokens.colors.textPrimary,
      borderRadius: mode === 'survival' ? 2 : 8,
    }),
    [tokens, mode],
  );

  const labelStyle = useMemo(
    () => ({
      color: tokens.colors.textSecondary,
    }),
    [tokens],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.manualEntryContainer}>
      <ScrollView
        style={styles.manualEntryScroll}
        contentContainerStyle={styles.manualEntryContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.manualEntryHeader}>
          <Edit3 size={24} color={tokens.colors.accentPrimary} />
          <Text style={[styles.manualEntryTitle, { color: tokens.colors.textPrimary }]}>
            Manual Entry
          </Text>
        </View>

        <View style={styles.formField}>
          <Text style={[styles.formLabel, labelStyle]}>Product Name *</Text>
          <TextInput
            style={[styles.formInput, inputStyle]}
            value={productName}
            onChangeText={setProductName}
            placeholder="Enter product name"
            placeholderTextColor={tokens.colors.textMuted}
            testID="manual-entry-product-name"
          />
        </View>

        <View style={styles.formField}>
          <Text style={[styles.formLabel, labelStyle]}>Category</Text>
          <TextInput
            style={[styles.formInput, inputStyle]}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g., Produce, Dairy, Pantry"
            placeholderTextColor={tokens.colors.textMuted}
            testID="manual-entry-category"
          />
        </View>

        <View style={styles.formField}>
          <Text style={[styles.formLabel, labelStyle]}>Quantity</Text>
          <TextInput
            style={[styles.formInput, inputStyle]}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="1"
            placeholderTextColor={tokens.colors.textMuted}
            keyboardType="numeric"
            testID="manual-entry-quantity"
          />
        </View>

        <View style={styles.formField}>
          <Text style={[styles.formLabel, labelStyle]}>Notes (optional)</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea, inputStyle]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Any additional notes..."
            placeholderTextColor={tokens.colors.textMuted}
            multiline
            numberOfLines={3}
            testID="manual-entry-notes"
          />
        </View>

        <View style={styles.formActions}>
          <TouchableOpacity
            style={[
              styles.formButton,
              styles.cancelButton,
              {
                borderColor: tokens.colors.borderDefault,
                borderRadius: mode === 'survival' ? 2 : 8,
              },
            ]}
            onPress={onCancel}
            testID="manual-entry-cancel">
            <X size={20} color={tokens.colors.textSecondary} />
            <Text style={[styles.buttonText, { color: tokens.colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.formButton,
              styles.submitButton,
              {
                backgroundColor: tokens.colors.accentPrimary,
                borderRadius: mode === 'survival' ? 2 : 8,
                opacity: productName.trim() ? 1 : 0.5,
              },
            ]}
            onPress={handleSubmit}
            disabled={!productName.trim()}
            testID="manual-entry-submit">
            <Check size={20} color="#FFFFFF" />
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Add Item</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================
// Scan Results Display Component
// Requirements: 7.3 - Display scan results using DualModeFeedCard
// ============================================

interface ScanResultsDisplayProps {
  mode: ThemeMode;
  tokens: DesignTokens;
  results: ScanResult[];
  onClose: () => void;
}

function ScanResultsDisplay({
  mode,
  tokens,
  results,
  onClose,
}: ScanResultsDisplayProps): React.JSX.Element {
  // Convert scan results to SharePost format for DualModeFeedCard
  const postsFromResults = useMemo(() => results.map(scanResultToSharePost), [results]);

  // Get mode config for styling reference
  const modeConfig = mode === 'survival' ? survivalModeConfig : abundanceModeConfig;

  return (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Package size={24} color={tokens.colors.accentPrimary} />
        <Text style={[styles.resultsTitle, { color: tokens.colors.textPrimary }]}>
          Scan Results ({results.length})
        </Text>
        <TouchableOpacity onPress={onClose} testID="results-close">
          <X size={24} color={tokens.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.resultsList}>
        {results.map((result, index) => {
          const post = postsFromResults[index];
          return (
            <View
              key={`${result.barcode}-${index}`}
              style={[
                styles.resultCard,
                {
                  backgroundColor: tokens.colors.backgroundCard,
                  borderColor: tokens.colors.borderDefault,
                  borderRadius: modeConfig.borderRadius,
                  shadowOpacity: modeConfig.shadowOpacity,
                  shadowRadius: modeConfig.shadowRadius,
                  elevation: modeConfig.elevation,
                  padding: modeConfig.padding,
                },
              ]}
              testID={`scan-result-${index}`}>
              {/* Barcode header */}
              <View style={styles.resultCardHeader}>
                <Barcode size={16} color={tokens.colors.accentPrimary} />
                <Text style={[styles.resultBarcode, { color: tokens.colors.textMuted }]}>
                  {result.barcode}
                </Text>
              </View>

              {/* Product info styled like DualModeFeedCard */}
              <Text style={[styles.resultProductName, { color: tokens.colors.textPrimary }]}>
                {post.title}
              </Text>

              {result.category && (
                <Text style={[styles.resultCategory, { color: tokens.colors.textSecondary }]}>
                  {result.category}
                </Text>
              )}

              {/* Timestamp footer */}
              <View style={styles.resultFooter}>
                <Text style={[styles.resultTimestamp, { color: tokens.colors.textMuted }]}>
                  Scanned {new Date(result.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            </View>
          );
        })}

        {results.length === 0 && (
          <View style={styles.emptyResults}>
            <AlertTriangle size={32} color={tokens.colors.textMuted} />
            <Text style={[styles.emptyResultsText, { color: tokens.colors.textMuted }]}>
              No items scanned yet
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ============================================
// Main PantryScanner Component
// Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
// ============================================

function PantryScannerComponent({
  mode,
  isActive = true,
  onScanComplete,
  onManualEntry,
  onClose,
  scanResults = [],
  testID,
}: PantryScannerProps): React.JSX.Element {
  const [currentView, setCurrentView] = useState<ScannerView>('camera');
  const [localResults, setLocalResults] = useState<ScanResult[]>(scanResults);

  // Animation values
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const viewTransitionAnim = useRef(new Animated.Value(0)).current;

  // Get tokens and config based on mode
  const tokens = useMemo(() => getTokensForMode(mode), [mode]);
  const viewfinderConfig = useMemo(() => getViewfinderConfig(mode), [mode]);

  // Check if camera should be active
  // Requirements: 7.4 - Disable camera in survival mode
  const isCameraActive = useMemo(() => shouldCameraBeActive(mode, isActive), [mode, isActive]);

  // Scan line animation (abundance mode only)
  useEffect(() => {
    if (mode === 'abundance' && isCameraActive && currentView === 'camera') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
    return undefined;
  }, [mode, isCameraActive, currentView, scanLineAnim]);

  // View transition animation
  // Requirements: 7.6 - Animate transitions between views
  const animateViewTransition = useCallback(
    (toView: ScannerView) => {
      Animated.sequence([
        Animated.timing(viewTransitionAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(viewTransitionAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Change view at midpoint of animation
      setTimeout(() => setCurrentView(toView), 150);
    },
    [viewTransitionAnim],
  );

  // Handle manual entry submission
  const handleManualEntry = useCallback(
    (data: ManualEntryData) => {
      const result: ScanResult = {
        barcode: `MANUAL-${Date.now()}`,
        productName: data.productName,
        category: data.category,
        timestamp: Date.now(),
      };
      setLocalResults(prev => [...prev, result]);
      onManualEntry?.(data);
      animateViewTransition('results');
    },
    [onManualEntry, animateViewTransition],
  );

  // Handle scan completion (simulated for now)
  const handleScanComplete = useCallback(
    (result: ScanResult) => {
      setLocalResults(prev => [...prev, result]);
      onScanComplete?.(result);
      animateViewTransition('results');
    },
    [onScanComplete, animateViewTransition],
  );

  // Navigation handlers
  const handleSwitchToManual = useCallback(() => {
    animateViewTransition('manual');
  }, [animateViewTransition]);

  const handleSwitchToCamera = useCallback(() => {
    animateViewTransition('camera');
  }, [animateViewTransition]);

  const handleShowResults = useCallback(() => {
    animateViewTransition('results');
  }, [animateViewTransition]);

  const handleCloseResults = useCallback(() => {
    animateViewTransition('camera');
  }, [animateViewTransition]);

  // Container animation style
  const containerAnimStyle = useMemo(
    () => ({
      opacity: viewTransitionAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 0.5, 1],
      }),
    }),
    [viewTransitionAnim],
  );

  return (
    <View
      style={[styles.container, { backgroundColor: tokens.colors.backgroundPrimary }]}
      testID={testID}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: tokens.colors.backgroundSecondary,
            borderBottomColor: tokens.colors.borderDefault,
          },
        ]}>
        <TouchableOpacity onPress={onClose} testID="scanner-close">
          <X size={24} color={tokens.colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: tokens.colors.textPrimary }]}>
          Pantry Scanner
        </Text>
        <TouchableOpacity onPress={handleShowResults} testID="scanner-show-results">
          <Package size={24} color={tokens.colors.accentPrimary} />
          {localResults.length > 0 && (
            <View style={[styles.resultsBadge, { backgroundColor: tokens.colors.accentPrimary }]}>
              <Text style={styles.resultsBadgeText}>{localResults.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main content with transition animation */}
      <Animated.View style={[styles.content, containerAnimStyle]}>
        {currentView === 'camera' && (
          <View style={styles.cameraView}>
            {/* Viewfinder */}
            <Viewfinder
              mode={mode}
              tokens={tokens}
              config={viewfinderConfig}
              isCameraActive={isCameraActive}
              scanLineAnim={scanLineAnim}
            />

            {/* Instructions */}
            <Text style={[styles.instructions, { color: tokens.colors.textSecondary }]}>
              {mode === 'survival'
                ? 'Use manual entry to add items'
                : 'Position barcode within the frame'}
            </Text>

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: tokens.colors.backgroundCard,
                    borderColor: tokens.colors.borderDefault,
                    borderRadius: mode === 'survival' ? 2 : 12,
                  },
                ]}
                onPress={handleSwitchToManual}
                testID="scanner-manual-entry-button">
                <Edit3 size={24} color={tokens.colors.accentPrimary} />
                <Text style={[styles.actionButtonText, { color: tokens.colors.textPrimary }]}>
                  Manual Entry
                </Text>
              </TouchableOpacity>

              {mode === 'abundance' && isCameraActive && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.scanButton,
                    {
                      backgroundColor: tokens.colors.accentPrimary,
                      borderRadius: 12,
                    },
                  ]}
                  onPress={() =>
                    handleScanComplete({
                      barcode: `SCAN-${Date.now()}`,
                      productName: 'Scanned Item',
                      timestamp: Date.now(),
                    })
                  }
                  testID="scanner-scan-button">
                  <ScanLine size={24} color="#FFFFFF" />
                  <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Scan</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {currentView === 'manual' && (
          <ManualEntryForm
            mode={mode}
            tokens={tokens}
            onSubmit={handleManualEntry}
            onCancel={handleSwitchToCamera}
          />
        )}

        {currentView === 'results' && (
          <ScanResultsDisplay
            mode={mode}
            tokens={tokens}
            results={localResults}
            onClose={handleCloseResults}
          />
        )}
      </Animated.View>
    </View>
  );
}

// ============================================
// Styles
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  resultsBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  cameraView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  viewfinder: {
    position: 'relative',
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDisabledContent: {
    alignItems: 'center',
    gap: 12,
  },
  cameraDisabledText: {
    fontSize: 14,
    textAlign: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  scanLine: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    top: 0,
  },
  decorativeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.3,
  },
  decorativeTop: {
    top: 0,
  },
  decorativeBottom: {
    bottom: 0,
  },
  survivalGuide: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  survivalGuideLine: {
    width: 40,
    height: 2,
  },
  instructions: {
    marginTop: 24,
    fontSize: 14,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 32,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderWidth: 1,
  },
  scanButton: {
    borderWidth: 0,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Manual entry styles
  manualEntryContainer: {
    flex: 1,
  },
  manualEntryScroll: {
    flex: 1,
  },
  manualEntryContent: {
    padding: 24,
  },
  manualEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },
  manualEntryTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  formTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
  formButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  cancelButton: {
    borderWidth: 1,
  },
  submitButton: {
    borderWidth: 0,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  // Results styles
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultsTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
  },
  resultsList: {
    flex: 1,
  },
  resultCard: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  resultCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultBarcode: {
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  resultProductName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultCategory: {
    fontSize: 14,
  },
  resultFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  resultTimestamp: {
    fontSize: 12,
  },
  emptyResults: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  emptyResultsText: {
    fontSize: 16,
  },
});

// ============================================
// Memoized Export
// ============================================

export const PantryScanner = React.memo(PantryScannerComponent);
PantryScanner.displayName = 'PantryScanner';

export default PantryScanner;
