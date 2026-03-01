import { contentService } from '@/services/contentService';
import { ProjectsPageClient } from '@/components/projects/ProjectsPageClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProjectsPage() {
  // Fetch projects on the server
  const projects = await contentService.getProjectsAsync();

  return <ProjectsPageClient initialProjects={projects} />;
}
