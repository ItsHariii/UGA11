/**
 * Permission Components
 * Export all permission-related UI components
 */

export {
  PermissionExplanationScreen,
  getPermissionExplanation,
  type PermissionExplanationScreenProps,
  type PermissionExplanation,
} from './PermissionExplanationScreen';

export {
  PermissionStatusBar,
  getPermissionIconConfig,
  getStatusIcon,
  shouldShowWarning,
  getReducedFunctionalityText,
  type PermissionStatusBarProps,
  type PermissionIconConfig,
} from './PermissionStatusBar';

export {
  BluetoothDisabledPrompt,
  type BluetoothDisabledPromptProps,
} from './BluetoothDisabledPrompt';
