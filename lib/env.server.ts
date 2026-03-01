/**
 * Server-only environment variable helpers
 * These should NEVER be imported in client components
 */

/**
 * Get the database URL from environment variables
 * @throws Error if DATABASE_URL is not set
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Please set it in your .env file.'
    );
  }
  return url;
}

/**
 * Get the Resend API key from environment variables
 * @throws Error if RESEND_API_KEY is not set when attempting to send emails
 */
export function getResendApiKey(): string {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error(
      'RESEND_API_KEY is not set. Please set it in your .env file to send emails.'
    );
  }
  return key;
}

/**
 * Get the FROM email address for Resend
 * Uses EMAIL_FROM env var (exact name as per requirements)
 * Defaults to a Resend-accepted development email
 * @returns FROM email address
 * @throws Error in production if EMAIL_FROM is not set
 */
export function getFromEmail(): string {
  const emailFrom = process.env.EMAIL_FROM;
  if (!emailFrom) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'EMAIL_FROM is not set. Please set it in your .env file.'
      );
    }
    // In development, use Resend-accepted default
    return 'onboarding@resend.dev';
  }
  return emailFrom;
}

/**
 * Get the application base URL for building absolute URLs
 * Prefers APP_BASE_URL, falls back to NEXT_PUBLIC_SITE_URL, then dev default
 * @returns Base URL (e.g., "http://localhost:3000" or "https://example.com")
 * @throws Error in production if neither APP_BASE_URL nor NEXT_PUBLIC_SITE_URL is set
 */
export function getAppBaseUrl(): string {
  const appBaseUrl = process.env.APP_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (!appBaseUrl) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'APP_BASE_URL or NEXT_PUBLIC_SITE_URL must be set in production. Please set it in your .env file.'
      );
    }
    // In development, use localhost default
    return 'http://localhost:3000';
  }
  return appBaseUrl;
}

/**
 * Get the coordinator fallback email for development
 * @returns Fallback email or undefined
 */
export function getCoordinatorFallbackEmail(): string | undefined {
  return process.env.COORDINATOR_FALLBACK_EMAIL;
}

/**
 * Get the test email override for Resend testing mode
 * When set, all emails are sent to this address instead of the intended recipient
 * @returns Test email address or undefined
 */
export function getResendTestToEmail(): string | undefined {
  return process.env.RESEND_TEST_TO_EMAIL;
}

/**
 * Get the admin access key for admin pages
 * @returns Admin key or undefined
 */
export function getAdminKey(): string | undefined {
  return process.env.ADMIN_KEY;
}

/**
 * Validate admin access key
 * @param providedKey - Key provided in query parameter
 * @returns True if key is valid
 */
export function validateAdminKey(providedKey: string | null | undefined): boolean {
  const adminKey = getAdminKey();
  if (!adminKey) {
    return false; // No admin key configured
  }
  return providedKey === adminKey;
}
