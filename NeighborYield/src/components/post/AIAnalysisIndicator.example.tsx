/**
 * AIAnalysisIndicator Example Usage
 * Demonstrates the three states: loading, success, and error
 */

import React, { useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import { AIAnalysisIndicator } from './AIAnalysisIndicator';

export function AIAnalysisIndicatorExample() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const simulateAnalysis = () => {
    // Reset states
    setError(null);
    setSuccess(false);
    setIsAnalyzing(true);

    // Simulate analysis for 2 seconds
    setTimeout(() => {
      setIsAnalyzing(false);
      setSuccess(true);
    }, 2000);
  };

  const simulateError = () => {
    // Reset states
    setSuccess(false);
    setIsAnalyzing(true);

    // Simulate error after 1 second
    setTimeout(() => {
      setIsAnalyzing(false);
      setError('Failed to analyze image. Please try again.');
    }, 1000);
  };

  const reset = () => {
    setIsAnalyzing(false);
    setError(null);
    setSuccess(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Simulate Success" onPress={simulateAnalysis} />
        <Button title="Simulate Error" onPress={simulateError} />
        <Button title="Reset" onPress={reset} />
      </View>

      <AIAnalysisIndicator
        isAnalyzing={isAnalyzing}
        error={error}
        success={success}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
});

export default AIAnalysisIndicatorExample;
