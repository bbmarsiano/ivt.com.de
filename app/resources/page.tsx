import { contentService } from '@/services/contentService';
import type { Resource, Project } from '@/lib/types/content';
import { ResourcesPageClient } from '@/components/resources/ResourcesPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProjectDownloadsGroup {
  projectSlug: string;
  projectTitle_de: string;
  projectTitle_en: string;
  resources: Resource[];
}

export default async function ResourcesPage() {
  // Fetch public resources and projects on the server
  const [publicResources, projects] = await Promise.all([
    contentService.getPublicResourcesAsync(),
    contentService.getProjectsAsync(),
  ]);

  // For project downloads, only consider projects that advertise resources
  const projectsWithResources = projects.filter((project: Project) => (project.resourcesCount || 0) > 0);

  // For each project with resources, fetch its resources and pre-filter to public, visible downloads
  const projectDownloadsEntries = await Promise.all(
    projectsWithResources.map(async (project) => {
      const resources = await contentService.getProjectResourcesAsync(project.slug);

      const downloadResources = resources.filter(
        (r) =>
          r.kind === 'download' &&
          r.visible &&
          !r.gated &&
          Array.isArray(r.categories) &&
          r.categories.includes('public')
      );

      if (downloadResources.length === 0) {
        return null;
      }

      return {
        projectSlug: project.slug,
        projectTitle_de: project.title_de,
        projectTitle_en: project.title_en,
        resources: downloadResources,
      } as ProjectDownloadsGroup;
    })
  );

  const projectDownloadsByProject = projectDownloadsEntries.filter(
    (group): group is ProjectDownloadsGroup => group !== null
  );

  // Build a set of resource IDs that are linked to any project downloads
  const linkedDownloadIds = new Set<string>();
  for (const group of projectDownloadsByProject) {
    for (const res of group.resources) {
      if (res.id) {
        linkedDownloadIds.add(res.id);
      }
    }
  }

  // Public, unlinked downloads (category public, kind=download, visible, not gated, not in any project)
  const unlinkedPublicDownloads = publicResources.filter(
    (r) =>
      r.kind === 'download' &&
      r.visible &&
      !r.gated &&
      (!Array.isArray(r.categories) || r.categories.includes('public')) &&
      !linkedDownloadIds.has(r.id)
  );

  return (
    <ResourcesPageClient
      publicResources={publicResources}
      unlinkedPublicDownloads={unlinkedPublicDownloads}
      projectDownloadsByProject={projectDownloadsByProject}
    />
  );
}
