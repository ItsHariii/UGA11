/**
 * Environment Configuration Utility
 * Loads and validates environment variables for the application
 */

import { GEMINI_API_KEY } from '@env';

/**
 * Configuration interface for environment variables
 */
export interface IEnvConfig {
  geminiApiKey: string | null;
  isConfigured: boolean;
}

/**
 * Loads the GEMINI_API_KEY from environment variables
 */
function loadEnvConfig(): IEnvConfig {
  // Load from @env module (react-native-dotenv)
  const apiKey = GEMINI_API_KEY || null;

  return {
    geminiApiKey: apiKey,
    isConfigured: apiKey !== null && apiKey.length > 0,
  };
}

/**
 * Singleton instance of environment configuration
 */
export const EnvConfig: IEnvConfig = loadEnvConfig();
