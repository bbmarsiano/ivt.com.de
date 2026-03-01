/**
 * Environment variable helpers with type safety and fallbacks
 */

export type Locale = 'de' | 'en';

/**
 * Get the site URL from environment variables
 * @returns Site URL, defaults to http://localhost:3000
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

/**
 * Get the default locale from environment variables
 * @returns Default locale, defaults to 'de'
 */
export function getDefaultLocale(): Locale {
  const locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE ?? 'de';
  return locale === 'en' ? 'en' : 'de';
}

/**
 * Get supported locales from environment variables
 * @returns Array of supported locales, defaults to ['de', 'en']
 */
export function getSupportedLocales(): Locale[] {
  const localesStr = process.env.NEXT_PUBLIC_SUPPORTED_LOCALES ?? 'de,en';
  const locales = localesStr.split(',').map((l) => l.trim().toLowerCase());
  const validLocales: Locale[] = [];
  
  for (const locale of locales) {
    if (locale === 'de' || locale === 'en') {
      validLocales.push(locale);
    }
  }
  
  // Ensure at least 'de' is included
  if (validLocales.length === 0) {
    return ['de'];
  }
  
  return validLocales;
}

/**
 * Check if a locale is supported
 * @param locale - Locale to check
 * @returns True if locale is supported
 */
export function isLocaleSupported(locale: string): locale is Locale {
  return getSupportedLocales().includes(locale as Locale);
}

// Placeholder environment variables (not used yet, but defined for future use)
export const DIRECTUS_URL = process.env.DIRECTUS_URL ?? '';
export const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN ?? '';
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? '';
