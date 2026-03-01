/**
 * Helper functions for working with bilingual content
 */

import type { Locale } from '@/lib/types/content';

/**
 * Get localized field from bilingual content object
 * 
 * @param content - Object with bilingual fields (e.g., { title_de: '...', title_en: '...' })
 * @param field - Base field name (e.g., 'title')
 * @param locale - Locale to retrieve ('de' | 'en')
 * @returns Localized field value, or fallback to 'de' if locale not found
 * 
 * @example
 * const title = getLocalizedField(project, 'title', 'en'); // Returns project.title_en
 */
export function getLocalizedField<T>(
  content: Record<string, any>,
  field: string,
  locale: Locale
): T | undefined {
  const localizedKey = `${field}_${locale}`;
  const fallbackKey = `${field}_de`;
  
  // Try requested locale first
  if (localizedKey in content && content[localizedKey] !== null && content[localizedKey] !== undefined) {
    return content[localizedKey] as T;
  }
  
  // Fallback to German
  if (fallbackKey in content) {
    return content[fallbackKey] as T;
  }
  
  return undefined;
}

/**
 * Get localized field with default value
 * 
 * @param content - Object with bilingual fields
 * @param field - Base field name
 * @param locale - Locale to retrieve
 * @param defaultValue - Default value if field is missing
 * @returns Localized field value or default
 */
export function getLocalizedFieldWithDefault<T>(
  content: Record<string, any>,
  field: string,
  locale: Locale,
  defaultValue: T
): T {
  return getLocalizedField(content, field, locale) ?? defaultValue;
}
