import type {
  Project,
  ProjectStatus,
  ProjectIndustry,
  Testimonial,
  NewsPost,
  EventItem,
  Partner,
  TeamMember,
  AboutContent,
  Resource,
  CmsPage,
  SiteSettings,
} from '@/lib/types/content';
import { mockProjects } from '@/lib/mock/projects';
import { mockTestimonials } from '@/lib/mock/testimonials';
import { mockNews } from '@/lib/mock/news';
import { mockEvents } from '@/lib/mock/events';
import { mockPartners, mockTeam, mockAboutContent, mockResources, mockResourceProjectLinks, mockResourceCategoryLinks } from '@/lib/data/mock-data';

// Conditionally import Directus service (server-only)
let directusService: typeof import('./directusContentService').directusContentService | null = null;

async function getDirectusService() {
  if (directusService) {
    return directusService;
  }

  // Only load in server environment
  if (typeof window === 'undefined') {
    try {
      const module = await import('./directusContentService');
      directusService = module.directusContentService;
      return directusService;
    } catch (error) {
      console.error('[IVT][CMS] Failed to load Directus service:', error);
      return null;
    }
  }

  return null;
}

// Server-only CMS source decision helper
function shouldUseDirectus(): { use: boolean; reason?: string } {
  // Only check on server
  if (typeof window !== 'undefined') {
    return { use: false, reason: 'client-side' };
  }

  try {
    // Dynamic import to avoid client-side execution
    const { isDirectusEnabled, getDirectusUrl, getDirectusToken } = require('@/lib/env.directus');
    
    if (!isDirectusEnabled()) {
      return { use: false, reason: 'USE_DIRECTUS disabled' };
    }

    const url = getDirectusUrl();
    if (!url) {
      return { use: false, reason: 'Missing DIRECTUS_URL' };
    }

    // Token is optional (can use public role)
    const token = getDirectusToken();
    if (!token) {
      // Still use Directus, but with public role
      return { use: true, reason: 'Using public role (no token)' };
    }

    return { use: true };
  } catch (error) {
    // If env.directus can't be loaded, fallback to mocks
    return { use: false, reason: 'Failed to load env helpers' };
  }
}

export interface ProjectFilters {
  search?: string;
  industry?: ProjectIndustry | 'all';
  status?: ProjectStatus | 'all';
  sortBy?: 'newest' | 'featured' | 'title-asc';
}

// Type aliases for backward compatibility (re-exported from types)
export type { NewsPost as NewsItem, EventItem as Event };

class ContentService {
  private async tryDirectus<T>(
    directusFn: () => Promise<T>,
    fallbackFn: () => T,
    methodName: string
  ): Promise<T> {
    const decision = shouldUseDirectus();
    
    if (!decision.use) {
      // Log every time why we're using mocks
      if (typeof window === 'undefined') {
        console.log(`[IVT][CMS] source=MOCKS reason=${decision.reason || 'USE_DIRECTUS disabled'} fn=${methodName}`);
      }
      return fallbackFn();
    }

    try {
      const service = await getDirectusService();
      if (service) {
        // Log Directus usage every time
        if (typeof window === 'undefined') {
          const { getDirectusUrl, getDirectusToken } = require('@/lib/env.directus');
          const url = getDirectusUrl();
          const token = getDirectusToken();
          const tokenLen = token?.length ?? 0;
          console.log(`[IVT][CMS] source=DIRECTUS url=${url} tokenLen=${tokenLen} fn=${methodName}`);
        }
        return await directusFn();
      }
    } catch (error) {
      // Log error every time
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[IVT][CMS] DIRECTUS_FETCH_FAILED fn=${methodName} error=${errorMessage}`);
    }

    // Fallback to mocks
    if (typeof window === 'undefined') {
      console.log(`[IVT][CMS] source=MOCKS reason=fallback_after_error fn=${methodName}`);
    }
    return fallbackFn();
  }

  getFeaturedProjects(): Project[] {
    // Synchronous method - always uses mocks
    // For Directus, use getFeaturedProjectsAsync() in server components
    return mockProjects.filter((project) => project.featured);
  }

  async getFeaturedProjectsAsync(): Promise<Project[]> {
    // Async method - uses Directus if enabled, otherwise mocks
    return this.tryDirectus(
      () => directusService!.getFeaturedProjects(),
      () => mockProjects.filter((project) => project.featured),
      'getFeaturedProjectsAsync'
    );
  }

  getProjects(filters?: ProjectFilters): Project[] {
    let filtered = [...mockProjects];

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((project) => {
        const titleMatch =
          project.title_de.toLowerCase().includes(searchLower) ||
          project.title_en.toLowerCase().includes(searchLower);
        const summaryMatch =
          project.summary_de.toLowerCase().includes(searchLower) ||
          project.summary_en.toLowerCase().includes(searchLower);
        const tagsMatch = project.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        return titleMatch || summaryMatch || tagsMatch;
      });
    }

    if (filters?.industry && filters.industry !== 'all') {
      filtered = filtered.filter(
        (project) => project.industry === filters.industry
      );
    }

    if (filters?.status && filters.status !== 'all') {
      filtered = filtered.filter((project) => project.status === filters.status);
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'featured':
          filtered.sort((a, b) => {
            if (a.featured === b.featured) return 0;
            return a.featured ? -1 : 1;
          });
          break;
        case 'title-asc':
          filtered.sort((a, b) => a.title_en.localeCompare(b.title_en));
          break;
      }
    }

    return filtered;
  }

  async getProjectsAsync(filters?: ProjectFilters): Promise<Project[]> {
    return this.tryDirectus(
      async () => {
        const projects = await directusService!.getProjects(filters);
        // Apply client-side filtering for tags if search was used
        let filtered = projects;

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter((project) => {
            const titleMatch =
              project.title_de.toLowerCase().includes(searchLower) ||
              project.title_en.toLowerCase().includes(searchLower);
            const summaryMatch =
              project.summary_de.toLowerCase().includes(searchLower) ||
              project.summary_en.toLowerCase().includes(searchLower);
            const tagsMatch = project.tags.some((tag) =>
              tag.toLowerCase().includes(searchLower)
            );
            return titleMatch || summaryMatch || tagsMatch;
          });
        }

        if (filters?.industry && filters.industry !== 'all') {
          filtered = filtered.filter(
            (project) => project.industry === filters.industry
          );
        }

        if (filters?.status && filters.status !== 'all') {
          filtered = filtered.filter((project) => project.status === filters.status);
        }

        if (filters?.sortBy) {
          switch (filters.sortBy) {
            case 'newest':
              filtered.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              break;
            case 'featured':
              filtered.sort((a, b) => {
                if (a.featured === b.featured) return 0;
                return a.featured ? -1 : 1;
              });
              break;
            case 'title-asc':
              filtered.sort((a, b) => a.title_en.localeCompare(b.title_en));
              break;
          }
        }

        // Add resourcesCount to each project
        const resourcesCountsResult = await directusService!.getResourcesCountsByProject();
        // resourcesCountsResult.countsByProjectId is Record<projectId, count>, so we need to map by project.id
        filtered = filtered.map((project) => ({
          ...project,
          resourcesCount: resourcesCountsResult.countsByProjectId[project.id] ?? 0,
        }));

        return filtered;
      },
      () => {
        // Mock fallback: compute resourcesCount from mock data
        const mockCounts = new Map<string, number>();
        Object.entries(mockResourceProjectLinks).forEach(([, projectSlugs]) => {
          projectSlugs.forEach((slug) => {
            mockCounts.set(slug, (mockCounts.get(slug) || 0) + 1);
          });
        });

        // Fallback to mock implementation
        let filtered = [...mockProjects];

        if (filters?.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter((project) => {
            const titleMatch =
              project.title_de.toLowerCase().includes(searchLower) ||
              project.title_en.toLowerCase().includes(searchLower);
            const summaryMatch =
              project.summary_de.toLowerCase().includes(searchLower) ||
              project.summary_en.toLowerCase().includes(searchLower);
            const tagsMatch = project.tags.some((tag) =>
              tag.toLowerCase().includes(searchLower)
            );
            return titleMatch || summaryMatch || tagsMatch;
          });
        }

        if (filters?.industry && filters.industry !== 'all') {
          filtered = filtered.filter(
            (project) => project.industry === filters.industry
          );
        }

        if (filters?.status && filters.status !== 'all') {
          filtered = filtered.filter((project) => project.status === filters.status);
        }

        if (filters?.sortBy) {
          switch (filters.sortBy) {
            case 'newest':
              filtered.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
              break;
            case 'featured':
              filtered.sort((a, b) => {
                if (a.featured === b.featured) return 0;
                return a.featured ? -1 : 1;
              });
              break;
            case 'title-asc':
              filtered.sort((a, b) => a.title_en.localeCompare(b.title_en));
              break;
          }
        }

        // Add resourcesCount to each project
        return filtered.map((project) => ({
          ...project,
          resourcesCount: mockCounts.get(project.slug) || 0,
        }));
      },
      'getProjectsAsync'
    );
  }

  getProjectBySlug(slug: string): Project | undefined {
    return mockProjects.find((project) => project.slug === slug);
  }

  async getProjectBySlugAsync(slug: string): Promise<Project | undefined> {
    return this.tryDirectus(
      () => directusService!.getProjectBySlug(slug),
      () => mockProjects.find((project) => project.slug === slug),
      'getProjectBySlugAsync'
    );
  }

  getAllTestimonials(): Testimonial[] {
    return mockTestimonials;
  }

  async getAllTestimonialsAsync(): Promise<Testimonial[]> {
    return this.tryDirectus(
      () => directusService!.getTestimonials(),
      () => mockTestimonials,
      'getAllTestimonialsAsync'
    );
  }

  getFeaturedTestimonials(): Testimonial[] {
    return mockTestimonials.filter((testimonial) => testimonial.featured);
  }

  async getFeaturedTestimonialsAsync(): Promise<Testimonial[]> {
    return this.tryDirectus(
      () => directusService!.getFeaturedTestimonials(),
      () => mockTestimonials.filter((testimonial) => testimonial.featured),
      'getFeaturedTestimonialsAsync'
    );
  }

  getAllNews(): NewsPost[] {
    return mockNews.sort(
      (a, b) =>
        new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  async getAllNewsAsync(): Promise<NewsPost[]> {
    return this.tryDirectus(
      () => directusService!.getAllNews(),
      () =>
        mockNews.sort(
          (a, b) =>
            new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        ),
      'getAllNewsAsync'
    );
  }

  // Alias for consistency with other content types
  async getNewsAsync(): Promise<NewsPost[]> {
    return this.getAllNewsAsync();
  }

  getLatestNews(limit: number = 3): NewsPost[] {
    return this.getAllNews().slice(0, limit);
  }

  async getLatestNewsAsync(limit: number = 3): Promise<NewsPost[]> {
    return this.tryDirectus(
      () => directusService!.getLatestNews(limit),
      () => this.getAllNews().slice(0, limit),
      'getLatestNewsAsync'
    );
  }

  getNewsBySlug(slug: string): NewsPost | undefined {
    return mockNews.find((item) => item.slug === slug);
  }

  async getNewsBySlugAsync(slug: string): Promise<NewsPost | undefined> {
    return this.tryDirectus(
      () => directusService!.getNewsBySlug(slug),
      () => mockNews.find((item) => item.slug === slug),
      'getNewsBySlugAsync'
    );
  }

  getAllEvents(): EventItem[] {
    return mockEvents.sort(
      (a, b) =>
        new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );
  }

  async getAllEventsAsync(): Promise<EventItem[]> {
    return this.tryDirectus(
      () => directusService!.getAllEvents(),
      () =>
        mockEvents.sort(
          (a, b) =>
            new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
        ),
      'getAllEventsAsync'
    );
  }

  getUpcomingEvents(limit: number = 3): EventItem[] {
    const now = new Date();
    return this.getAllEvents()
      .filter((event) => new Date(event.start_at) >= now)
      .slice(0, limit);
  }

  async getUpcomingEventsAsync(limit: number = 3): Promise<EventItem[]> {
    return this.tryDirectus(
      () => directusService!.getUpcomingEvents(limit),
      () => {
        const now = new Date();
        return this.getAllEvents()
          .filter((event) => new Date(event.start_at) >= now)
          .slice(0, limit);
      },
      'getUpcomingEventsAsync'
    );
  }

  getEventBySlug(slug: string): EventItem | undefined {
    return mockEvents.find((event) => event.slug === slug);
  }

  async getEventBySlugAsync(slug: string): Promise<EventItem | undefined> {
    return this.tryDirectus(
      () => directusService!.getEventBySlug(slug),
      () => mockEvents.find((event) => event.slug === slug),
      'getEventBySlugAsync'
    );
  }

  getAllPartners(): Partner[] {
    return mockPartners;
  }

  async getAllPartnersAsync(): Promise<Partner[]> {
    return this.tryDirectus(
      () => directusService!.getPartners(),
      () => mockPartners,
      'getAllPartnersAsync'
    );
  }

  // Alias for consistency
  async getPartnersAsync(): Promise<Partner[]> {
    return this.getAllPartnersAsync();
  }

  getAllTeam(): TeamMember[] {
    return mockTeam.sort((a, b) => {
      // Sort by sort asc, then last_name
      if (a.sort !== b.sort) {
        return a.sort - b.sort;
      }
      return a.last_name.localeCompare(b.last_name);
    });
  }

  async getAllTeamAsync(): Promise<TeamMember[]> {
    return this.tryDirectus(
      () => directusService!.getTeam(),
      () => {
        return mockTeam.sort((a, b) => {
          // Sort by sort asc, then last_name
          if (a.sort !== b.sort) {
            return a.sort - b.sort;
          }
          return a.last_name.localeCompare(b.last_name);
        });
      },
      'getAllTeamAsync'
    );
  }

  async getFeaturedTeamAsync(): Promise<TeamMember[]> {
    return this.tryDirectus(
      async () => {
        const allTeam = await directusService!.getTeam();
        return allTeam.filter((member) => member.featured);
      },
      () => {
        return mockTeam
          .filter((member) => member.featured)
          .sort((a, b) => {
            if (a.sort !== b.sort) {
              return a.sort - b.sort;
            }
            return a.last_name.localeCompare(b.last_name);
          });
      },
      'getFeaturedTeamAsync'
    );
  }

  async getAboutContentAsync(): Promise<AboutContent> {
    return this.tryDirectus(
      async () => {
        const content = await directusService!.getAboutContent();
        if (!content) {
          // If Directus returns null, fall back to mocks
          return mockAboutContent;
        }
        return content;
      },
      () => mockAboutContent,
      'getAboutContentAsync'
    );
  }

  async getProjectResourcesAsync(slug: string): Promise<Resource[]> {
    const shouldUse = shouldUseDirectus();
    if (!shouldUse.use) {
      // Directus disabled, use mocks
      const projectResourceKeys = Object.entries(mockResourceProjectLinks)
        .filter(([_, slugs]) => slugs.includes(slug))
        .map(([key]) => key);
      const projectResources = mockResources.filter((r) => projectResourceKeys.includes(r.key));
      const publicResources = mockResources.filter((r) => {
        const hasProjectLink = Object.values(mockResourceProjectLinks).some((slugs) => slugs.includes(r.key));
        return !hasProjectLink && mockResourceCategoryLinks[r.key]?.includes('public');
      });
      return [...projectResources, ...publicResources];
    }

    // Directus enabled - try to fetch
    try {
      const service = await getDirectusService();
      if (!service) {
        throw new Error('Directus service not available');
      }

      // Get project first to get its ID
      const project = await service.getProjectBySlug(slug);
      if (!project) {
        // Project not found, return empty array (don't fallback to mocks)
        return [];
      }

      // Get resources by project ID
      const projectResources = await service.getResourcesByProjectId(project.id);
      const publicResources = await service.getPublicResources();
      
      // Combine and return (even if empty - don't fallback to mocks)
      const combined = [...projectResources, ...publicResources];
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=DIRECTUS url=${process.env.DIRECTUS_URL || 'N/A'} tokenLen=${process.env.DIRECTUS_TOKEN?.length || 0} fn=getProjectResourcesAsync count=${combined.length}`);
      }
      
      return combined;
    } catch (error) {
      // Only fallback to mocks on error
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] DIRECTUS_FETCH_FAILED fn=getProjectResourcesAsync error=${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      
      // Fallback to mocks
      const projectResourceKeys = Object.entries(mockResourceProjectLinks)
        .filter(([_, slugs]) => slugs.includes(slug))
        .map(([key]) => key);
      const projectResources = mockResources.filter((r) => projectResourceKeys.includes(r.key));
      const publicResources = mockResources.filter((r) => {
        const hasProjectLink = Object.values(mockResourceProjectLinks).some((slugs) => slugs.includes(r.key));
        return !hasProjectLink && mockResourceCategoryLinks[r.key]?.includes('public');
      });
      return [...projectResources, ...publicResources];
    }
  }

  async getPublicResourcesAsync(): Promise<Resource[]> {
    const shouldUse = shouldUseDirectus();
    if (!shouldUse.use) {
      // Directus disabled, use mocks
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=MOCKS reason=${shouldUse.reason || 'USE_DIRECTUS disabled'} fn=getPublicResourcesAsync`);
      }
      return mockResources.filter((r) => {
        const hasProjectLink = Object.values(mockResourceProjectLinks).some((slugs) => slugs.includes(r.key));
        return !hasProjectLink && mockResourceCategoryLinks[r.key]?.includes('public');
      });
    }

    // Directus enabled - try to fetch
    try {
      const service = await getDirectusService();
      if (!service) {
        throw new Error('Directus service not available');
      }

      const resources = await service.getPublicResources();
      
      // Log success
      const { getDirectusUrl, getDirectusToken } = require('@/lib/env.directus');
      const url = getDirectusUrl() || 'N/A';
      const token = getDirectusToken();
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=DIRECTUS url=${url} tokenLen=${token?.length || 0} fn=getPublicResourcesAsync count=${resources.length}`);
      }
      
      return resources;
    } catch (error) {
      // Extract HTTP status if available
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const statusMatch = errorMessage.match(/\((\d+)\)/);
      const status = statusMatch ? statusMatch[1] : 'unknown';
      
      // Log failure with status
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] DIRECTUS_FETCH_FAILED fn=getPublicResourcesAsync status=${status} error=${errorMessage}`);
      }
      
      // Fallback to mocks (but log reason)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=MOCKS reason=Directus fetch failed (${status}) fn=getPublicResourcesAsync`);
      }
      
      return mockResources.filter((r) => {
        const hasProjectLink = Object.values(mockResourceProjectLinks).some((slugs) => slugs.includes(r.key));
        return !hasProjectLink && mockResourceCategoryLinks[r.key]?.includes('public');
      });
    }
  }

  async getPageBySlugAsync(slug: string): Promise<CmsPage | null> {
    const shouldUse = shouldUseDirectus();
    if (!shouldUse.use) {
      // Directus disabled, return null (no mock pages)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=MOCKS reason=${shouldUse.reason || 'USE_DIRECTUS disabled'} fn=getPageBySlugAsync`);
      }
      return null;
    }

    // Directus enabled - try to fetch
    try {
      const service = await getDirectusService();
      if (!service) {
        throw new Error('Directus service not available');
      }

      const page = await service.getPageBySlug(slug);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=DIRECTUS url=${process.env.DIRECTUS_URL || 'N/A'} tokenLen=${process.env.DIRECTUS_TOKEN?.length || 0} fn=getPageBySlugAsync slug=${slug} found=${!!page}`);
      }
      
      return page || null;
    } catch (error) {
      // Only log error, return null (fallback)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] DIRECTUS_FETCH_FAILED fn=getPageBySlugAsync error=${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    }
  }

  async getSiteSettingsAsync(): Promise<SiteSettings | null> {
    const shouldUse = shouldUseDirectus();
    if (!shouldUse.use) {
      // Directus disabled, return null (no mock settings)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] source=MOCKS reason=${shouldUse.reason || 'USE_DIRECTUS disabled'} fn=getSiteSettingsAsync`);
      }
      return null;
    }

    // Directus enabled - try to fetch
    try {
      const service = await getDirectusService();
      if (!service) {
        throw new Error('Directus service not available');
      }

      const settings = await service.getSiteSettings();
      
      if (process.env.NODE_ENV === 'development') {
        const found = settings !== null && settings.id !== undefined;
        console.log(`[IVT][CMS] source=DIRECTUS url=${process.env.DIRECTUS_URL || 'N/A'} tokenLen=${process.env.DIRECTUS_TOKEN?.length || 0} fn=getSiteSettingsAsync found=${found} id=${settings?.id || 'null'}`);
      }
      
      return settings;
    } catch (error) {
      // Only log error, return null (fallback)
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] DIRECTUS_FETCH_FAILED fn=getSiteSettingsAsync error=${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    }
  }
}

export const contentService = new ContentService();

export type {
  Project,
  Testimonial,
  NewsPost,
  EventItem,
  Partner,
  TeamMember,
  AboutContent,
  Resource,
  CmsPage,
  SiteSettings,
  ProjectStatus,
  ProjectIndustry,
};
