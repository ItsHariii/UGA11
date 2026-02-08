/**
 * Environment Configuration Utility
 * Loads and validates environment variables for the application
 */

/**
 * Configuration interface for environment variables
 */
export interface IEnvConfig {
  geminiApiKey: string | null;
  isConfigured: boolean;
}

/**
 * Loads the GEMINI_API_KEY from environment variables
 * @returns Configuration object with API key and availability status
 */
function loadEnvConfig(): IEnvConfig {
  // Try to load from process.env (Node.js) or global env object (React Native)
  const apiKey = typeof process !== 'undefined' && process.env
    ? process.env.GEMINI_API_KEY || null
    : null;

  return {
    geminiApiKey: apiKey,
    isConfigured: apiKey !== null && apiKey.length > 0,
  };
}

/**
 * Singleton instance of environment configuration
 * Loaded once at module initialization
 */
export const EnvConfig: IEnvConfig = loadEnvConfig();
