/**
 * Server-only coordinator email resolution
 * This should NEVER be imported in client components
 */

import { contentService } from '@/services/contentService';
import { getCoordinatorFallbackEmail } from '@/lib/env.server';

/**
 * Resolve coordinator email for a project slug
 * @param projectSlug - Project slug to look up
 * @returns Coordinator email address
 * @throws Error if coordinator email cannot be resolved
 */
export function resolveCoordinatorEmail(projectSlug: string): string {
  const project = contentService.getProjectBySlug(projectSlug);

  if (project?.coordinator?.email) {
    return project.coordinator.email;
  }

  // Fallback to env var for development
  const fallbackEmail = getCoordinatorFallbackEmail();
  if (fallbackEmail) {
    return fallbackEmail;
  }

  throw new Error(
    `Cannot resolve coordinator email for project: ${projectSlug}. ` +
      'Please set COORDINATOR_FALLBACK_EMAIL in your .env file for development.'
  );
}
