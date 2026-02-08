/**
 * Error Handling Utility
 * Provides centralized error handling with user-friendly messages and logging
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */

import { Alert, Linking } from 'react-native';

/**
 * Error types for the food scanner feature
 */
export type ErrorType =
  | 'permission_denied'
  | 'permission_camera'
  | 'permission_library'
  | 'image_validation'
  | 'image_too_large'
  | 'image_invalid_format'
  | 'image_corrupted'
  | 'image_compression'
  | 'ai_analysis'
  | 'ai_timeout'
  | 'ai_rate_limit'
  | 'ai_network'
  | 'ai_non_food'
  | 'upload_failed'
  | 'upload_network'
  | 'upload_auth'
  | 'upload_quota'
  | 'unknown';

/**
 * Error details for logging and display
 */
export interface ErrorDetails {
  type: ErrorType;
  message: string;
  userMessage: string;
  technicalDetails?: string;
  recoverable: boolean;
  requiresAction?: 'settings' | 'retry' | 'skip' | 'none';
}

/**
 * Error logging configuration
 */
interface ErrorLogEntry {
  timestamp: string;
  type: ErrorType;
  message: string;
  technicalDetails?: string;
  stack?: string;
}

// In-memory error log (could be persisted to storage or sent to analytics)
const errorLog: ErrorLogEntry[] = [];
const MAX_LOG_ENTRIES = 100;

/**
 * Logs an error for debugging
 * Requirements: 6.5
 */
export function logError(
  type: ErrorType,
  message: string,
  error?: Error | unknown,
  technicalDetails?: string
): void {
  const logEntry: ErrorLogEntry = {
    timestamp: new Date().toISOString(),
    type,
    message,
    technicalDetails,
    stack: error instanceof Error ? error.stack : undefined,
  };

  // Add to in-memory log
  errorLog.push(logEntry);
  
  // Keep log size manageable
  if (errorLog.length > MAX_LOG_ENTRIES) {
    errorLog.shift();
  }

  // Console logging for development
  console.error('[ErrorHandler]', {
    type,
    message,
    technicalDetails,
    error: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
  });

  // TODO: Send to analytics service in production
  // analytics.logError(logEntry);
}

/**
 * Gets the error log (for debugging)
 */
export function getErrorLog(): ErrorLogEntry[] {
  return [...errorLog];
}

/**
 * Clears the error log
 */
export function clearErrorLog(): void {
  errorLog.length = 0;
}

/**
 * Parses an error and returns structured error details
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function parseError(error: Error | unknown, context?: string): ErrorDetails {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorLower = errorMessage.toLowerCase();

  // Permission errors
  if (errorLower.includes('permission') || errorLower.includes('denied')) {
    if (errorLower.includes('camera')) {
      return {
        type: 'permission_camera',
        message: errorMessage,
        userMessage: 'Camera access is needed to take photos. Please enable it in Settings.',
        technicalDetails: context,
        recoverable: true,
        requiresAction: 'settings',
      };
    }
    if (errorLower.includes('library') || errorLower.includes('photo')) {
      return {
        type: 'permission_library',
        message: errorMessage,
        userMessage: 'Photo library access is needed. Please enable it in Settings.',
        technicalDetails: context,
        recoverable: true,
        requiresAction: 'settings',
      };
    }
    return {
      type: 'permission_denied',
      message: errorMessage,
      userMessage: 'Permission is required to access photos. Please enable it in Settings.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'settings',
    };
  }

  // Image validation errors
  if (errorLower.includes('too large') || errorLower.includes('5mb')) {
    return {
      type: 'image_too_large',
      message: errorMessage,
      userMessage: 'Image is too large. Please select an image under 5MB.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  if (errorLower.includes('invalid format') || errorLower.includes('jpeg') || errorLower.includes('png')) {
    return {
      type: 'image_invalid_format',
      message: errorMessage,
      userMessage: 'Invalid image format. Please select a JPEG or PNG image.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  if (errorLower.includes('corrupted') || errorLower.includes('invalid image')) {
    return {
      type: 'image_corrupted',
      message: errorMessage,
      userMessage: 'The image appears to be corrupted. Please try a different image.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  if (errorLower.includes('compress')) {
    return {
      type: 'image_compression',
      message: errorMessage,
      userMessage: 'Failed to process the image. Please try a different image.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  // AI analysis errors
  if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return {
      type: 'ai_timeout',
      message: errorMessage,
      userMessage: 'Analysis timed out. You can still create the post manually.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'skip',
    };
  }

  if (errorLower.includes('rate limit') || errorLower.includes('quota')) {
    return {
      type: 'ai_rate_limit',
      message: errorMessage,
      userMessage: 'Too many requests. Please wait a moment and try again.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  if (errorLower.includes('network') || errorLower.includes('connection')) {
    return {
      type: 'ai_network',
      message: errorMessage,
      userMessage: 'Network error. Check your connection and try again.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  if (errorLower.includes('not food') || errorLower.includes('non-food')) {
    return {
      type: 'ai_non_food',
      message: errorMessage,
      userMessage: 'This doesn\'t appear to be a food item. You can still create the post manually.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'skip',
    };
  }

  if (errorLower.includes('analysis') || errorLower.includes('classify')) {
    return {
      type: 'ai_analysis',
      message: errorMessage,
      userMessage: 'Analysis failed. You can still create the post manually.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'skip',
    };
  }

  // Upload errors
  if (errorLower.includes('upload')) {
    if (errorLower.includes('network') || errorLower.includes('connection')) {
      return {
        type: 'upload_network',
        message: errorMessage,
        userMessage: 'Upload failed due to network error. Please try again.',
        technicalDetails: context,
        recoverable: true,
        requiresAction: 'retry',
      };
    }
    if (errorLower.includes('auth') || errorLower.includes('unauthorized')) {
      return {
        type: 'upload_auth',
        message: errorMessage,
        userMessage: 'Upload failed due to authentication error. Please sign in again.',
        technicalDetails: context,
        recoverable: false,
        requiresAction: 'none',
      };
    }
    if (errorLower.includes('quota') || errorLower.includes('storage')) {
      return {
        type: 'upload_quota',
        message: errorMessage,
        userMessage: 'Storage quota exceeded. Please contact support.',
        technicalDetails: context,
        recoverable: false,
        requiresAction: 'none',
      };
    }
    return {
      type: 'upload_failed',
      message: errorMessage,
      userMessage: 'Image upload failed. You can retry or continue without an image.',
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'retry',
    };
  }

  // User cancellation (not really an error)
  if (errorLower.includes('cancel')) {
    return {
      type: 'unknown',
      message: errorMessage,
      userMessage: '', // Don't show message for cancellation
      technicalDetails: context,
      recoverable: true,
      requiresAction: 'none',
    };
  }

  // Unknown error
  return {
    type: 'unknown',
    message: errorMessage,
    userMessage: 'An unexpected error occurred. Please try again.',
    technicalDetails: context,
    recoverable: true,
    requiresAction: 'retry',
  };
}

/**
 * Shows an error alert to the user with appropriate actions
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
export function showErrorAlert(
  errorDetails: ErrorDetails,
  onRetry?: () => void,
  onSkip?: () => void
): void {
  // Don't show alert for cancellation or empty messages
  if (!errorDetails.userMessage) {
    return;
  }

  const buttons: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }> = [];

  // Add action buttons based on error type
  switch (errorDetails.requiresAction) {
    case 'settings':
      buttons.push({
        text: 'Cancel',
        style: 'cancel',
      });
      buttons.push({
        text: 'Open Settings',
        onPress: () => {
          Linking.openSettings();
        },
      });
      break;

    case 'retry':
      buttons.push({
        text: 'Cancel',
        style: 'cancel',
      });
      if (onRetry) {
        buttons.push({
          text: 'Retry',
          onPress: onRetry,
        });
      }
      break;

    case 'skip':
      buttons.push({
        text: 'OK',
        style: 'cancel',
      });
      if (onSkip) {
        buttons.push({
          text: 'Continue Manually',
          onPress: onSkip,
        });
      }
      break;

    default:
      buttons.push({
        text: 'OK',
      });
  }

  Alert.alert(
    getErrorTitle(errorDetails.type),
    errorDetails.userMessage,
    buttons,
    { cancelable: true }
  );
}

/**
 * Gets a user-friendly title for an error type
 */
function getErrorTitle(type: ErrorType): string {
  switch (type) {
    case 'permission_denied':
    case 'permission_camera':
    case 'permission_library':
      return 'Permission Required';
    
    case 'image_validation':
    case 'image_too_large':
    case 'image_invalid_format':
    case 'image_corrupted':
    case 'image_compression':
      return 'Image Error';
    
    case 'ai_analysis':
    case 'ai_timeout':
    case 'ai_rate_limit':
    case 'ai_network':
    case 'ai_non_food':
      return 'Analysis Error';
    
    case 'upload_failed':
    case 'upload_network':
    case 'upload_auth':
    case 'upload_quota':
      return 'Upload Error';
    
    default:
      return 'Error';
  }
}

/**
 * Handles an error with logging and optional user alert
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 */
export function handleError(
  error: Error | unknown,
  context: string,
  options?: {
    showAlert?: boolean;
    onRetry?: () => void;
    onSkip?: () => void;
  }
): ErrorDetails {
  const errorDetails = parseError(error, context);
  
  // Log the error
  logError(
    errorDetails.type,
    errorDetails.message,
    error,
    errorDetails.technicalDetails
  );

  // Show alert if requested
  if (options?.showAlert) {
    showErrorAlert(errorDetails, options.onRetry, options.onSkip);
  }

  return errorDetails;
}
