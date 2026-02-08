/**
 * AIAnalysisIndicator Component
 * Displays loading, success, and error states for AI food analysis
 * 
 * Requirements: 5.1, 5.3, 6.1
 */

import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle, AlertCircle } from 'lucide-react-native';

export interface AIAnalysisIndicatorProps {
  isAnalyzing: boolean;
  error: string | null;
  success: boolean;
  testID?: string;
}

/**
 * AIAnalysisIndicator Component
 * Shows animated spinner during analysis
 * Displays success checkmark with scale animation
 * Shows error message with shake animation
 */
export function AIAnalysisIndicator({
  isAnalyzing,
  error,
  success,
  testID = 'ai-analysis-indicator',
}: AIAnalysisIndicatorProps): React.JSX.Element | null {
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Success animation - scale from 0 to 1 with spring
  useEffect(() => {
    if (success && !isAnalyzing && !error) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 10,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [success, isAnalyzing, error, scaleAnim]);

  // Error animation - shake horizontally
  useEffect(() => {
    if (error) {
      // Reset position
      shakeAnim.setValue(0);
      
      // Shake sequence: 0 -> 10 -> -10 -> 0
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeAnim]);

  // Don't render if no state is active
  if (!isAnalyzing && !error && !success) {
    return null;
  }

  // Loading state
  if (isAnalyzing) {
    return (
      <View
        style={styles.container}
        accessibilityRole="progressbar"
        accessibilityLabel="Analyzing food image"
        testID={`${testID}-loading`}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="small" color="#2e7d32" />
          <Text style={styles.loadingText}>Analyzing food image...</Text>
        </View>
      </View>
    );
  }

  // Success state
  if (success && !error) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.successContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
        accessibilityRole="alert"
        accessibilityLabel="Analysis complete"
        testID={`${testID}-success`}>
        <View style={styles.successContent}>
          <CheckCircle size={20} color="#5a8a5e" strokeWidth={2} />
          <Text style={styles.successText}>Analysis complete!</Text>
        </View>
      </Animated.View>
    );
  }

  // Error state
  if (error) {
    return (
      <Animated.View
        style={[
          styles.container,
          styles.errorContainer,
          { transform: [{ translateX: shakeAnim }] },
        ]}
        accessibilityRole="alert"
        accessibilityLabel={`Analysis error: ${error}`}
        testID={`${testID}-error`}>
        <View style={styles.errorContent}>
          <AlertCircle size={20} color="#c75b3f" strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Animated.View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    // Earthy shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    padding: 12,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2e7d32',
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
  },
  successContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5a8a5e',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#c75b3f',
    flex: 1,
  },
});

export default AIAnalysisIndicator;
