/**
 * Debug API endpoint for CMS source verification
 * GET /api/debug/cms
 * 
 * Returns environment info, Directus server info, and sample data
 * to definitively prove whether Directus is being used.
 */

import { NextResponse } from 'next/server';
import { getCmsEnvDebug, getDirectusUrl, getDirectusToken } from '@/lib/env.directus';

export const dynamic = 'force-dynamic'; // Disable caching
export const revalidate = 0;

/**
 * Helper to convert Directus file ID to media proxy URL
 * Returns `/api/media/${fileId}` if fileId is a UUID, otherwise null
 */
function toMediaProxyUrl(fileId: string | null | undefined | { id?: string }): string | null {
  if (!fileId) {
    return null;
  }

  // Extract file ID if it's an object
  let id: string | null = null;
  if (typeof fileId === 'string') {
    id = fileId;
  } else if (typeof fileId === 'object' && fileId !== null && 'id' in fileId && typeof fileId.id === 'string') {
    id = fileId.id;
  }

  if (!id) {
    return null;
  }

  // Check if it looks like a UUID (Directus file ID)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return `/api/media/${id}`;
  }

  return null;
}

/**
 * Deduplicate resources by key, preferring resources that have categories defined
 * @param resources Array of resource objects with a `key` property
 * @returns Deduplicated array of resources
 */
function dedupeResourcesByKey(resources: any[]): any[] {
  const map = new Map<string, any>();

  for (const r of resources) {
    const existing = map.get(r.key);

    if (!existing) {
      map.set(r.key, r);
      continue;
    }

    // Prefer resource that has categories
    const existingHasCategories = Array.isArray(existing.categories) && existing.categories.length > 0;
    const newHasCategories = Array.isArray(r.categories) && r.categories.length > 0;

    if (!existingHasCategories && newHasCategories) {
      map.set(r.key, r);
    }
  }

  return Array.from(map.values());
}

interface DebugResponse {
  env: ReturnType<typeof getCmsEnvDebug>;
  directusServerInfo: any | null;
  directusProjectsSample: any[] | null;
  directusTeamSample: any[] | null;
  directusAboutSample: any | null;
  directusResourcesSample: any[] | null;
  directusResourcesCountSample: any | null;
  directusResourcesProjectsSample: any[] | null;
  directusProjectResourcesSample: any[] | null;
  directusResourcesByProjectSample: any[] | null;
  directusResourcesProjectsAggregateRaw: any | null;
  directusResourcesCountsByProjectId: Record<string, number> | null;
  directusPublicResourcesSample: any[] | null;
  errors: {
    about?: string;
    [key: string]: string | undefined;
  } | null;
}

export async function GET(): Promise<NextResponse<DebugResponse>> {
  const errors: { about?: string; [key: string]: string | undefined } = {};
  let directusServerInfo: any | null = null;
  let directusProjectsSample: any[] | null = null;
  let directusTeamSample: any[] | null = null;
  let directusAboutSample: any | null = null;
  let directusResourcesSample: any[] | null = null;
  let directusResourcesCountSample: any | null = null;
  let directusResourcesProjectsSample: any[] | null = null;
  let directusProjectResourcesSample: any[] | null = null;
  let directusResourcesByProjectSample: any[] | null = null;
  let directusResourcesProjectsAggregateRaw: any | null = null;
  let directusResourcesCountsByProjectId: Record<string, number> | null = null;
  let directusPublicResourcesSample: any[] | null = null;

  const env = getCmsEnvDebug();
  const directusUrl = getDirectusUrl();
  const directusToken = getDirectusToken();

  // Try to fetch Directus server info
  if (directusUrl) {
    try {
      const serverInfoUrl = `${directusUrl}/server/info`;
      const serverInfoResponse = await fetch(serverInfoUrl, {
        cache: 'no-store',
        headers: directusToken
          ? {
              Authorization: `Bearer ${directusToken}`,
            }
          : {},
      });

      if (serverInfoResponse.ok) {
        directusServerInfo = await serverInfoResponse.json();
      } else {
        errors.serverInfo = `Directus server info failed: ${serverInfoResponse.status} ${serverInfoResponse.statusText}`;
      }
    } catch (error) {
      errors.serverInfo = `Directus server info error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch sample projects from Directus
    try {
      const projectsUrl = `${directusUrl}/items/projects?limit=3&fields=id,slug,title_en,title_de,featured,status,industry`;
      const projectsResponse = await fetch(projectsUrl, {
        cache: 'no-store',
        headers: directusToken
          ? {
              Authorization: `Bearer ${directusToken}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            },
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        directusProjectsSample = projectsData.data || [];
      } else {
        errors.projects = `Directus projects fetch failed: ${projectsResponse.status} ${projectsResponse.statusText}`;
      }
    } catch (error) {
      errors.projects = `Directus projects fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch sample team members from Directus
    try {
      const teamUrl = `${directusUrl}/items/team?limit=2&fields=id,slug,first_name,last_name,avatar_file`;
      const teamResponse = await fetch(teamUrl, {
        cache: 'no-store',
        headers: directusToken
          ? {
              Authorization: `Bearer ${directusToken}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            },
      });

      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const teamItems = teamData.data || [];
        // Map to include derived avatarUrl (using media proxy route)
        directusTeamSample = teamItems.map((item: any) => {
          const avatarUrl = toMediaProxyUrl(item.avatar_file);
          return {
            id: item.id,
            slug: item.slug,
            first_name: item.first_name,
            last_name: item.last_name,
            avatar_file: item.avatar_file,
            avatarUrl,
          };
        });
      } else {
        errors.team = `Directus team fetch failed: ${teamResponse.status} ${teamResponse.statusText}`;
      }
    } catch (error) {
      errors.team = `Directus team fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch about singleton using contentService (same code path as page)
    try {
      const { contentService } = await import('@/services/contentService');
      const aboutContent = await contentService.getAboutContentAsync();
      
      if (aboutContent) {
        // Ensure hero_image_url uses proxy route (contentService should already return it, but ensure consistency)
        const heroImageUrl = aboutContent.heroImageUrl || toMediaProxyUrl(aboutContent.heroImageFile);
        directusAboutSample = {
          title_en: aboutContent.title_en,
          title_de: aboutContent.title_de,
          hero_image_file: aboutContent.heroImageFile || null,
          hero_image_url: heroImageUrl,
        };
      } else {
        directusAboutSample = null;
        errors.about = 'About content is null (may be using mocks or fetch failed)';
      }
    } catch (error) {
      errors.about = `About fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch sample resources from Directus
    try {
      const { contentService } = await import('@/services/contentService');
      const resources = await contentService.getPublicResourcesAsync();
      
      if (resources && resources.length > 0) {
        directusResourcesSample = resources.slice(0, 3).map((resource) => ({
          key: resource.key,
          title_en: resource.title_en,
          type: resource.type || 'FILE', // Ensure type is never null
          file_id: resource.file_id || null,
          external_url: resource.external_url || null,
          downloadUrl: resource.downloadUrl || null,
          gated: resource.gated || false,
        }));
      } else {
        directusResourcesSample = [];
      }
    } catch (error) {
      errors.resources = `Resources fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to get resources count for one project
    try {
      const { contentService } = await import('@/services/contentService');
      const projects = await contentService.getProjectsAsync();
      if (projects && projects.length > 0) {
        const projectWithResources = projects.find((p) => (p.resourcesCount || 0) > 0);
        if (projectWithResources) {
          directusResourcesCountSample = {
            projectSlug: projectWithResources.slug,
            projectTitle: projectWithResources.title_en,
            resourcesCount: projectWithResources.resourcesCount || 0,
          };
        }
      }
    } catch (error) {
      errors.resourcesCount = `Resources count fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch resources_projects junction sample
    try {
      const junctionUrl = `${directusUrl}/items/resources_projects?limit=5&fields=resource_id.key,project_id`;
      const junctionResponse = await fetch(junctionUrl, {
        cache: 'no-store',
        headers: directusToken
          ? {
              Authorization: `Bearer ${directusToken}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            },
      });

      if (junctionResponse.ok) {
        const junctionData = await junctionResponse.json();
        directusResourcesProjectsSample = (junctionData.data || []).map((item: any) => ({
          resource_key: item.resource_id?.key || null,
          project_id: item.project_id || null,
        }));
      } else {
        errors.resourcesProjects = `Directus resources_projects fetch failed: ${junctionResponse.status} ${junctionResponse.statusText}`;
      }
    } catch (error) {
      errors.resourcesProjects = `Directus resources_projects fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch project resources for a known project slug
    try {
      const { contentService } = await import('@/services/contentService');
      const projectResources = await contentService.getProjectResourcesAsync('renewable-energy-grid');
      if (projectResources) {
        directusProjectResourcesSample = projectResources.slice(0, 5).map((resource) => ({
          key: resource.key,
          title_en: resource.title_en,
          type: resource.type || 'FILE', // Ensure type is never null
          file_id: resource.file_id || null,
          external_url: resource.external_url || null,
          downloadUrl: resource.downloadUrl || null,
          gated: resource.gated || false,
        }));
      }
    } catch (error) {
      errors.projectResources = `Project resources fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch resources counts aggregate (raw + parsed)
    try {
      const { directusContentService } = await import('@/services/directusContentService');
      const countsResult = await directusContentService.getResourcesCountsByProject();
      directusResourcesProjectsAggregateRaw = countsResult.raw;
      directusResourcesCountsByProjectId = countsResult.countsByProjectId;
    } catch (error) {
      errors.resourcesCountsAggregate = `Resources counts aggregate fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch public resources sample with downloadUrl details
    try {
      const { contentService } = await import('@/services/contentService');
      const publicResources = await contentService.getPublicResourcesAsync();
      if (publicResources && publicResources.length > 0) {
        const { isResourcePublic, shouldShowRequestAccess, isDownloadUrlVisible } = await import('@/lib/utils/resources');
        const mappedResources = publicResources.slice(0, 5).map((resource) => ({
          key: resource.key,
          title_en: resource.title_en,
          type: resource.type || 'FILE', // Ensure type is never null
          file_id: resource.file_id || null,
          external_url: resource.external_url || null,
          downloadUrl: resource.downloadUrl || null,
          gated: resource.gated || false,
          categories: resource.categories || [],
          isPublic: isResourcePublic(resource),
          shouldShowRequestAccess: shouldShowRequestAccess(resource),
          downloadUrlVisible: isDownloadUrlVisible(resource),
        }));
        // Deduplicate by key, preferring resources with categories
        directusPublicResourcesSample = dedupeResourcesByKey(mappedResources);
      } else {
        directusPublicResourcesSample = [];
      }
    } catch (error) {
      errors.publicResources = `Public resources fetch error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }

    // Try to fetch project resources for "digital-health" project slug
    try {
      const { contentService } = await import('@/services/contentService');
      const projectResources = await contentService.getProjectResourcesAsync('digital-health');
      if (projectResources && projectResources.length > 0) {
        const { isResourcePublic, shouldShowRequestAccess, isDownloadUrlVisible } = await import('@/lib/utils/resources');
        const mappedResources = projectResources.slice(0, 5).map((resource) => ({
          key: resource.key,
          title_en: resource.title_en,
          type: resource.type || 'FILE', // Ensure type is never null
          file_id: resource.file_id || null,
          external_url: resource.external_url || null,
          downloadUrl: resource.downloadUrl || null, // Already uses /api/media when file_id exists
          gated: resource.gated || false,
          categories: resource.categories || undefined, // Optional field
          isPublic: isResourcePublic(resource),
          shouldShowRequestAccess: shouldShowRequestAccess(resource),
          downloadUrlVisible: isDownloadUrlVisible(resource),
        }));
        // Deduplicate by key, preferring resources with categories
        directusResourcesByProjectSample = dedupeResourcesByKey(mappedResources);
      } else {
        directusResourcesByProjectSample = [];
      }
    } catch (error) {
      errors.resourcesByProject = `Project resources fetch error (digital-health): ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  } else {
    errors.url = 'DIRECTUS_URL not set';
  }

  const response: DebugResponse = {
    env,
    directusServerInfo,
    directusProjectsSample,
    directusTeamSample,
    directusAboutSample,
    directusResourcesSample,
    directusResourcesCountSample,
    directusResourcesProjectsSample,
    directusProjectResourcesSample,
    directusResourcesByProjectSample,
    directusResourcesProjectsAggregateRaw: process.env.NODE_ENV === 'development' ? directusResourcesProjectsAggregateRaw : null,
    directusResourcesCountsByProjectId: process.env.NODE_ENV === 'development' ? directusResourcesCountsByProjectId : null,
    directusPublicResourcesSample,
    errors: Object.keys(errors).length > 0 ? errors : null,
  };

  return NextResponse.json(response);
}
