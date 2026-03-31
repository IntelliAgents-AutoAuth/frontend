/**
 * Polling Configuration
 * Centralized settings for all API polling operations across the application
 */

export const POLLING_CONFIG = {
  // Auto-retry settings for PA workflow data fetching
  STATUS_POLLING: {
    maxRetries: 15, // Maximum number of retry attempts
    initialDelayMs: 500, // Starting delay in milliseconds
    maxDelayMs: 5000, // Maximum delay in milliseconds
    backoffMultiplier: 1, // Linear backoff (500ms increment)
    calculateDelay: (attempt) => Math.min(500 + attempt * 500, 5000),
  },

  // Case status polling settings
  CASE_STATUS_POLLING: {
    maxAttempts: 20,
    intervalMs: 3000, // Poll every 3 seconds
  },

  // EHR synchronization progress settings
  EHR_SYNC_POLLING: {
    maxRetries: 10,
    intervalMs: 1000, // Check progress every 1 second
  },

  // Default timeouts
  TIMEOUTS: {
    apiCallTimeout: 30000, // 30 seconds for API calls
    pollTimeoutMs: 180000, // 3 minutes total polling time
  },
};

export default POLLING_CONFIG;
