/**
 * Directus Environment Helpers (Server-Only)
 * 
 * ⚠️ WARNING: This module is server-only and must never be imported in client components.
 * It accesses process.env which may contain sensitive tokens.
 */

// Server-only guard: throw if executed in browser
if (typeof window !== 'undefined') {
  throw new Error(
    'env.directus is server-only and cannot be imported in client components'
  );
}

/**
 * Check if Directus is enabled via USE_DIRECTUS environment variable
 * @returns true if USE_DIRECTUS is "1" or "true"
 */
export function isDirectusEnabled(): boolean {
  const value = process.env.USE_DIRECTUS;
  return value === '1' || value === 'true';
}

/**
 * Get Directus URL from environment
 * @returns Directus URL or null if not set
 */
export function getDirectusUrl(): string | null {
  return process.env.DIRECTUS_URL || null;
}

/**
 * Get Directus token from environment
 * @returns Directus token or null if not set
 */
export function getDirectusToken(): string | null {
  return process.env.DIRECTUS_TOKEN || null;
}

/**
 * Get CMS environment debug information
 * Safe to log (does not expose token value)
 * @returns Object with environment debug info
 */
export function getCmsEnvDebug(): {
  USE_DIRECTUS: string | undefined;
  DIRECTUS_URL: string | undefined;
  DIRECTUS_TOKEN_LEN: number;
  NODE_ENV: string | undefined;
} {
  return {
    USE_DIRECTUS: process.env.USE_DIRECTUS,
    DIRECTUS_URL: process.env.DIRECTUS_URL,
    DIRECTUS_TOKEN_LEN: process.env.DIRECTUS_TOKEN?.length ?? 0,
    NODE_ENV: process.env.NODE_ENV,
  };
}
