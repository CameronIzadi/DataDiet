/**
 * Conditional debug logging utility.
 * Only logs in development mode to prevent PII leakage in production.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Log debug messages only in development mode.
 * Never log PII (email, names, etc.) even in development.
 */
export function debugLog(message: string, data?: Record<string, unknown>): void {
  if (isDevelopment) {
    console.log(`[DEBUG] ${message}`, data ?? '');
  }
}

/**
 * Log warnings in all environments (for non-sensitive info only).
 */
export function warnLog(message: string, data?: Record<string, unknown>): void {
  console.warn(`[WARN] ${message}`, data ?? '');
}

/**
 * Log errors in all environments (for non-sensitive info only).
 */
export function errorLog(message: string, error?: unknown): void {
  console.error(`[ERROR] ${message}`, error ?? '');
}
