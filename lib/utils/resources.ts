/**
 * Helper utilities for resource rendering and gated access
 */

import type { Resource, Project } from '@/lib/types/content';

/**
 * Resource link properties for rendering download/open buttons
 */
export interface ResourceLinkProps {
  href: string;
  target?: '_blank';
  rel?: 'noopener noreferrer';
  download?: boolean | string;
  label: string;
  icon: 'download' | 'external-link' | 'lock-keyhole';
  isFile: boolean; // true if internal file (/api/media/), false if external
}

/**
 * Get the CTA URL for gated resources
 * @param resource The resource that requires access
 * @param _project Optional project context (for project-specific resources, currently unused)
 * @returns URL string: `/contact?resource=<key>` if contact route exists, else mailto link
 */
export function getGatedCtaUrl(resource: Resource, _project?: Project): string {
  // Prefer /contact route if it exists (we know it does from app/contact/page.tsx)
  // In a more dynamic setup, we could check if route exists, but for now we'll use /contact
  const resourceKey = resource.key || resource.id;
  
  // Build contact URL with resource query param
  const contactUrl = `/contact?resource=${encodeURIComponent(resourceKey)}`;
  
  // For now, we'll use /contact. If needed, we can add a check later
  // to verify the route exists, but since we have app/contact/page.tsx, it should exist
  return contactUrl;
  
  // Fallback to mailto (commented out since /contact exists, but keeping for reference):
  // const DEFAULT_CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@ivt.de';
  // const resourceTitle = resource.title_en || resource.title_de || 'Resource';
  // const subject = encodeURIComponent(`Access request: ${resourceTitle}`);
  // const body = encodeURIComponent(
  //   `Hello,\n\nI would like to request access to the following resource:\n\n` +
  //   `Resource: ${resourceTitle}\n` +
  //   `Key: ${resourceKey}\n` +
  //   (_project ? `Project: ${_project.title_en || _project.title_de}\n` : '') +
  //   `\nThank you!`
  // );
  // return `mailto:${DEFAULT_CONTACT_EMAIL}?subject=${subject}&body=${body}`;
}

/**
 * Get button label for resource action
 * @param resource The resource
 * @param language Language code ('de' | 'en')
 * @returns Button label string
 */
export function getResourceButtonLabel(resource: Resource, language: 'de' | 'en' = 'en'): string {
  // Only non-public gated resources show "Request access"
  if (shouldShowRequestAccess(resource)) {
    return language === 'de' ? 'Zugang anfragen' : 'Request access';
  }
  
  if (resource.type === 'LINK') {
    return language === 'de' ? 'Öffnen' : 'Open';
  }
  
  return language === 'de' ? 'Herunterladen' : 'Download';
}

/**
 * Get helper text for gated resources
 * @param language Language code ('de' | 'en')
 * @returns Helper text string
 */
export function getGatedHelperText(language: 'de' | 'en' = 'en'): string {
  return language === 'de'
    ? 'Dieser Inhalt erfordert eine Zugangsanfrage.'
    : 'This content requires an access request.';
}

/**
 * Check if a resource is public (has 'public' category)
 * Public resources always allow direct download, ignoring gated flag
 * @param resource The resource
 * @returns true if resource has 'public' category
 */
export function isResourcePublic(resource: Resource): boolean {
  return Array.isArray(resource.categories) && resource.categories.includes('public');
}

/**
 * Check if a resource should show "Request Access" button
 * Only non-public gated resources require access request
 * @param resource The resource
 * @returns true if resource should show request access button
 */
export function shouldShowRequestAccess(resource: Resource): boolean {
  // Public resources never require access request
  if (isResourcePublic(resource)) {
    return false;
  }
  // Only gated non-public resources require access request
  return resource.gated === true;
}

/**
 * Get link properties for a resource (for download/open buttons)
 * Handles all download URL types: /api/media/ (internal files), http (external)
 * Business rule: Public resources always downloadable (ignore gated flag)
 * @param resource The resource
 * @param language Language code ('de' | 'en')
 * @returns ResourceLinkProps with href, target, rel, download, label, icon, isFile
 */
export function getResourceLinkProps(
  resource: Resource,
  language: 'de' | 'en' = 'en'
): ResourceLinkProps | null {
  // Public resources always allow direct download (ignore gated flag)
  const isPublic = isResourcePublic(resource);
  
  // If gated AND not public, return null (handled separately by request access modal)
  if (resource.gated && !isPublic) {
    return null;
  }

  const downloadUrl = resource.downloadUrl;
  if (!downloadUrl) {
    return null;
  }

  const isInternalFile = downloadUrl.startsWith('/api/media/');
  const isExternal = downloadUrl.startsWith('http://') || downloadUrl.startsWith('https://');
  const isLinkType = resource.type === 'LINK';

  // Internal file download (/api/media/)
  if (isInternalFile) {
    return {
      href: downloadUrl,
      download: true, // Browser will download the file (or open PDF if user prefers)
      label: language === 'de' ? 'Herunterladen' : 'Download',
      icon: 'download',
      isFile: true,
    };
  }

  // External URL
  if (isExternal) {
    if (isLinkType) {
      // LINK type: always open in new tab
      return {
        href: downloadUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        label: language === 'de' ? 'Öffnen' : 'Open',
        icon: 'external-link',
        isFile: false,
      };
    } else {
      // External document (PDF/DOC/etc): download/open in new tab
      return {
        href: downloadUrl,
        target: '_blank',
        rel: 'noopener noreferrer',
        label: language === 'de' ? 'Herunterladen' : 'Download',
        icon: 'download',
        isFile: false,
      };
    }
  }

  // Fallback: treat as internal link
  return {
    href: downloadUrl,
    label: language === 'de' ? 'Öffnen' : 'Open',
    icon: 'external-link',
    isFile: false,
  };
}

/**
 * Check if downloadUrl should be visible to client
 * Gated non-public resources must never expose downloadUrl (especially /api/media/<file_id>)
 * @param resource The resource
 * @returns true if downloadUrl can be safely exposed in HTML/JSON
 */
export function isDownloadUrlVisible(resource: Resource): boolean {
  // Public resources always show downloadUrl
  if (isResourcePublic(resource)) {
    return true;
  }
  // Gated non-public resources must never expose downloadUrl
  if (resource.gated && !isResourcePublic(resource)) {
    return false;
  }
  // Non-gated resources can show downloadUrl
  return !!resource.downloadUrl;
}

/**
 * Get resource source indicator label (File vs External)
 * @param resource The resource
 * @param language Language code ('de' | 'en')
 * @returns Label string or null if not applicable
 */
export function getResourceSourceLabel(
  resource: Resource,
  language: 'de' | 'en' = 'en'
): string | null {
  // Only show source label if downloadUrl is visible
  if (!isDownloadUrlVisible(resource) || !resource.downloadUrl) {
    return null;
  }

  if (resource.downloadUrl.startsWith('/api/media/')) {
    return language === 'de' ? 'Datei' : 'File';
  }

  if (resource.downloadUrl.startsWith('http://') || resource.downloadUrl.startsWith('https://')) {
    return language === 'de' ? 'Extern' : 'External';
  }

  return null;
}
