/**
 * Directus Content Service (Server-Only)
 * Fetches content from Directus CMS via REST API
 * 
 * This module is server-only and must never be imported in client components.
 * It uses environment variables that should not be exposed to the browser.
 */

// Server-only guard: throw if executed in browser
if (typeof window !== 'undefined') {
  throw new Error(
    'directusContentService is server-only and cannot be imported in client components'
  );
}

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
import { getDirectusToken, getDirectusUrl } from '@/lib/env.directus';

// ProjectFilters is defined in contentService, duplicate here for type safety
export interface ProjectFilters {
  search?: string;
  industry?: ProjectIndustry | 'all';
  status?: ProjectStatus | 'all';
  sortBy?: 'newest' | 'featured' | 'title-asc';
}

// Directus API types
interface DirectusItem {
  id: string;
  [key: string]: any;
}

interface DirectusResponse<T> {
  data: T[] | T; // Can be array (collection) or object (singleton)
  meta?: {
    total_count?: number;
  };
}

class DirectusContentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getDirectusUrl() || 'http://localhost:8055';
  }

  /**
   * Unified Directus fetch helper that ALWAYS includes Authorization header when token is present
   * @param path API path (e.g., '/items/projects')
   * @returns Parsed JSON response
   * @throws Error with HTTP status and response body snippet on non-2xx
   */
  private async fetchDirectus<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const token = getDirectusToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ALWAYS include token if present
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    if (!response.ok) {
      // Get error body snippet (first 200 chars) for debugging
      let errorBody = '';
      try {
        const text = await response.text();
        errorBody = text.length > 200 ? text.substring(0, 200) + '...' : text;
      } catch {
        errorBody = 'Unable to read error response';
      }

      throw new Error(
        `Directus API error (${response.status}): ${errorBody}`
      );
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  }

  private mapDirectusProject(item: DirectusItem): Project {
    // Parse JSON fields if they're strings
    const parseJson = (value: any): any => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    };

    return {
      id: item.id,
      slug: item.slug,
      status: item.status as ProjectStatus,
      industry: item.industry as ProjectIndustry,
      title_de: item.title_de,
      title_en: item.title_en,
      summary_de: item.summary_de,
      summary_en: item.summary_en,
      description_de: item.description_de,
      description_en: item.description_en,
      thumbnail: item.thumbnail,
      images: parseJson(item.images) || [],
      tags: parseJson(item.tags) || [],
      featured: item.featured || false,
      coordinator: parseJson(item.coordinator) || {},
      metrics: item.metrics ? parseJson(item.metrics) : undefined,
      eligibility_de: parseJson(item.eligibility_de) || [],
      eligibility_en: parseJson(item.eligibility_en) || [],
      documents: parseJson(item.documents) || [],
      createdAt: item.createdAt || new Date().toISOString(),
    };
  }

  private mapDirectusEvent(item: DirectusItem): EventItem {
    // Handle cover image: use mapDirectusFileToUrl helper (returns proxy URL for UUIDs)
    const coverUrl = this.mapDirectusFileToUrl(item.cover) || undefined;

    return {
      id: item.id,
      slug: item.slug,
      title_de: item.title_de,
      title_en: item.title_en,
      description_de: item.description_de,
      description_en: item.description_en,
      location: item.location,
      start_at: item.start_at,
      end_at: item.end_at,
      cover: coverUrl,
    };
  }

  private mapDirectusNews(item: DirectusItem): NewsPost {
    const parseJson = (value: any): any => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    };

    // Handle cover image: use mapDirectusFileToUrl helper (returns proxy URL for UUIDs)
    const coverUrl = this.mapDirectusFileToUrl(item.cover) || undefined;

    return {
      id: item.id,
      slug: item.slug,
      title_de: item.title_de,
      title_en: item.title_en,
      summary_de: item.summary_de,
      summary_en: item.summary_en,
      published_at: item.published_at,
      cover: coverUrl,
      tags: parseJson(item.tags) || [],
    };
  }

  private mapDirectusTestimonial(item: DirectusItem): Testimonial {
    return {
      id: item.id,
      quote_de: item.quote_de,
      quote_en: item.quote_en,
      author_name: item.author_name,
      author_title_de: item.author_title_de,
      author_title_en: item.author_title_en,
      company_name: item.company_name,
      company_logo: item.company_logo || undefined,
      featured: item.featured || false,
    };
  }

  async getProjects(filters?: ProjectFilters): Promise<Project[]> {
    const params = new URLSearchParams();
    params.append('limit', '-1'); // Get all items

    // Build filter query
    const filterParts: string[] = [];

    if (filters?.industry && filters.industry !== 'all') {
      filterParts.push(`filter[industry][_eq]=${encodeURIComponent(filters.industry)}`);
    }

    if (filters?.status && filters.status !== 'all') {
      filterParts.push(`filter[status][_eq]=${encodeURIComponent(filters.status)}`);
    }

    if (filters?.search) {
      // Directus OR filter for search across multiple fields
      const searchLower = filters.search.toLowerCase();
      filterParts.push(
        `filter[_or][0][title_de][_icontains]=${encodeURIComponent(searchLower)}`,
        `filter[_or][1][title_en][_icontains]=${encodeURIComponent(searchLower)}`,
        `filter[_or][2][summary_de][_icontains]=${encodeURIComponent(searchLower)}`,
        `filter[_or][3][summary_en][_icontains]=${encodeURIComponent(searchLower)}`
      );
    }

    // Sorting
    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          params.append('sort', '-createdAt');
          break;
        case 'featured':
          params.append('sort', '-featured');
          break;
        case 'title-asc':
          params.append('sort', 'title_en');
          break;
      }
    } else {
      params.append('sort', '-createdAt'); // Default sort
    }

    const filterQuery = filterParts.length > 0 ? '&' + filterParts.join('&') : '';
      const endpoint = `/items/projects?${params.toString()}${filterQuery}`;

    const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
    const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
    let projects = dataArray
      .filter((item: DirectusItem): item is DirectusItem => item != null)
      .map((item: DirectusItem) => this.mapDirectusProject(item));

    // Client-side filtering for tags (if search was used, filter tags client-side as Directus doesn't support JSON array contains easily)
    if (filters?.search && projects.length > 0) {
      const searchLower = filters.search.toLowerCase();
      projects = projects.filter((project: Project) => {
        const tagsMatch = project.tags.some((tag: string) =>
          tag.toLowerCase().includes(searchLower)
        );
        return tagsMatch || true; // Keep if tags match, or if already matched by other fields
      });
    }

    return projects;
  }

  async getProjectBySlug(slug: string): Promise<Project | undefined> {
    try {
      const endpoint = `/items/projects?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const items = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const item = items[0];
      return item ? this.mapDirectusProject(item) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getFeaturedProjects(): Promise<Project[]> {
    try {
      const endpoint = `/items/projects?filter[featured][_eq]=true&sort=-createdAt&limit=-1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusProject(item));
    } catch (error) {
      return [];
    }
  }

  async getUpcomingEvents(limit: number = 3): Promise<EventItem[]> {
    try {
      const now = new Date().toISOString();
      const endpoint = `/items/events?filter[start_at][_gte]=${encodeURIComponent(now)}&sort=start_at&limit=${limit}`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusEvent(item));
    } catch (error) {
      return [];
    }
  }

  async getLatestNews(limit: number = 3): Promise<NewsPost[]> {
    try {
      const endpoint = `/items/news?sort=-published_at&limit=${limit}`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusNews(item));
    } catch (error) {
      return [];
    }
  }

  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    try {
      const limitParam = limit ? `&limit=${limit}` : '&limit=-1';
      const endpoint = `/items/testimonials?sort=-featured${limitParam}`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusTestimonial(item));
    } catch (error) {
      return [];
    }
  }

  async getFeaturedTestimonials(): Promise<Testimonial[]> {
    try {
      const endpoint = `/items/testimonials?filter[featured][_eq]=true&limit=-1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusTestimonial(item));
    } catch (error) {
      return [];
    }
  }

  async getAllNews(): Promise<NewsPost[]> {
    try {
      const endpoint = `/items/news?sort=-published_at&limit=-1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusNews(item));
    } catch (error) {
      return [];
    }
  }

  async getNewsBySlug(slug: string): Promise<NewsPost | undefined> {
    try {
      const endpoint = `/items/news?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const items = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const item = items[0];
      return item ? this.mapDirectusNews(item) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  async getAllEvents(): Promise<EventItem[]> {
    try {
      const endpoint = `/items/events?sort=start_at&limit=-1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      return dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusEvent(item));
    } catch (error) {
      return [];
    }
  }

  async getEventBySlug(slug: string): Promise<EventItem | undefined> {
    try {
      const endpoint = `/items/events?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const items = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const item = items[0];
      return item ? this.mapDirectusEvent(item) : undefined;
    } catch (error) {
      return undefined;
    }
  }

  private mapDirectusPartner(item: DirectusItem): Partner {
    // Handle logo: prefer logo_file (Directus file FK) over logo field
    // Use mapDirectusFileToUrl helper which returns proxy URL for UUIDs
    let logoUrl: string | undefined = undefined;

    // First, check logo_file (Directus file FK)
    if (item.logo_file) {
      logoUrl = this.mapDirectusFileToUrl(item.logo_file) || undefined;
    } else if (item.logo) {
      // Fallback to logo field
      logoUrl = this.mapDirectusFileToUrl(item.logo) || undefined;
    }

    return {
      id: item.id,
      name: item.name,
      logo: logoUrl,
      website: item.website || undefined,
    };
  }

  async getPartners(): Promise<Partner[]> {
    try {
      // Include logo_file field for Directus file FK support
      const endpoint = `/items/partners?sort=-createdAt&limit=-1&fields=id,name,website,logo,logo_file,createdAt`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const partners = dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusPartner(item));
      
      // Dev-only logging: log a sample partner to confirm logo_file mapping
      if (process.env.NODE_ENV === 'development' && partners.length > 0 && dataArray.length > 0) {
        const samplePartner = partners[0];
        const sampleItem = dataArray[0];
        if (samplePartner && sampleItem) {
          console.log(
            `[IVT][CMS] partners sample: { name: "${samplePartner.name}", logo: "${samplePartner.logo || 'undefined'}", logo_file_present: ${!!sampleItem.logo_file} }`
          );
        }
      }
      
      return partners;
    } catch (error) {
      return [];
    }
  }

  /**
   * Helper to map Directus file ID to proxy URL
   * Supports: UUID string, object with id property, or already a URL
   * Returns /api/media/:id for UUIDs (proxied through Next.js with server-side auth)
   */
  private mapDirectusFileToUrl(value: any): string | null {
    if (value === null || value === undefined) {
      return null;
    }

    let fileId: string | null = null;

    // Handle different shapes: "uuid" or { id: "uuid" }
    if (typeof value === 'string') {
      fileId = value;
    } else if (typeof value === 'object' && value !== null && value.id) {
      fileId = value.id;
    } else {
      return null;
    }

    if (!fileId) {
      return null;
    }

    // Check if it's already a full URL (http/https) - keep as-is, don't double-proxy
    if (fileId.startsWith('http://') || fileId.startsWith('https://')) {
      return fileId;
    }

    // Check if it starts with '/' (relative path) - keep as-is
    if (fileId.startsWith('/')) {
      return fileId;
    }

    // Check if it looks like a UUID (Directus file ID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(fileId)) {
      // It's a Directus file ID, use Next.js proxy route (server-side auth)
      return `/api/media/${fileId}`;
    }

    // Assume it's a relative path or filename, use as-is
    return fileId;
  }

  private mapDirectusTeamMember(item: DirectusItem): TeamMember {
    // Extract avatar_file (raw UUID) and compute avatarUrl
    const avatarFile = item.avatar_file || null;
    const avatarUrl = this.mapDirectusFileToUrl(item.avatar_file);

    return {
      id: item.id,
      slug: item.slug,
      first_name: item.first_name,
      last_name: item.last_name,
      role_de: item.role_de,
      role_en: item.role_en,
      bio_de: item.bio_de,
      bio_en: item.bio_en,
      email: item.email || undefined,
      linkedin: item.linkedin || undefined,
      avatarFile: typeof avatarFile === 'string' ? avatarFile : (typeof avatarFile === 'object' && avatarFile?.id ? avatarFile.id : null),
      avatarUrl,
      sort: item.sort || 0,
      featured: item.featured || false,
      createdAt: item.createdAt || new Date().toISOString(),
    };
  }

  async getTeam(): Promise<TeamMember[]> {
    try {
      // Sort by sort asc, then last_name, then first_name
      // Explicitly fetch avatar_file field
      const endpoint = `/items/team?sort=sort,last_name,first_name&limit=-1&fields=id,slug,first_name,last_name,role_de,role_en,bio_de,bio_en,email,linkedin,featured,sort,avatar_file,createdAt`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const team = dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusTeamMember(item));
      
      if (process.env.NODE_ENV === 'development' && team.length > 0) {
        const sample = team[0];
        if (sample) {
          console.log(
            `[IVT][CMS] team fetched: { count: ${team.length}, sample: { name: "${sample.first_name} ${sample.last_name}", avatar_file: ${sample.avatarFile ? 'present' : 'null'}, avatar_url: ${sample.avatarUrl || 'null'} } }`
          );
        }
      }
      
      return team;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getTeam error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return [];
    }
  }

  async getAboutContent(): Promise<AboutContent | null> {
    try {
      // Singleton: fetch with explicit fields, include hero_image_file
      const endpoint = `/items/about?fields=id,title_de,title_en,intro_de,intro_en,mission_de,mission_en,vision_de,vision_en,hero_image_file,updatedAt,createdAt`;
      const response = await this.fetchDirectus<any>(endpoint);
      
      // Handle both shapes: {data: [...]} or {data: {...}}
      const raw = response.data;
      if (!raw) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[IVT][CMS] getAboutContent: response.data is null/undefined`);
        }
        return null;
      }
      
      // Extract item: if array, take first; if object, use directly
      const item = Array.isArray(raw) ? raw[0] : raw;
      if (!item || !item.id) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[IVT][CMS] getAboutContent: no valid item found in response`);
        }
        return null;
      }
      
      // Map hero_image_file to URL
      const heroImageFile = item.hero_image_file || null;
      const heroImageUrl = this.mapDirectusFileToUrl(item.hero_image_file);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[IVT][CMS] about content fetched: { title_en: "${item.title_en || ''}", hero_image_file: ${heroImageFile ? 'present' : 'null'}, hero_image_url: ${heroImageUrl || 'null'} }`
        );
      }
      
      return {
        id: item.id,
        title_de: item.title_de || '',
        title_en: item.title_en || '',
        intro_de: item.intro_de || '',
        intro_en: item.intro_en || '',
        mission_de: item.mission_de || '',
        mission_en: item.mission_en || '',
        vision_de: item.vision_de || '',
        vision_en: item.vision_en || '',
        heroImageFile: typeof heroImageFile === 'string' ? heroImageFile : (typeof heroImageFile === 'object' && heroImageFile?.id ? heroImageFile.id : null),
        heroImageUrl,
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getAboutContent error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    }
  }

  private mapDirectusResource(item: DirectusItem): Resource {
    // Guard: Ensure type is never null
    let resourceType = item.type;
    if (!resourceType || resourceType === null || resourceType === undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[IVT][CMS] resources missing type for key=${item.key || item.id}, defaulting to "FILE"`
        );
      }
      resourceType = 'FILE';
    }

    const fileId = item.file_id || null;
    const externalUrl = item.external_url || null;
    const isLinkType = resourceType === 'LINK';
    
    // Compute downloadUrl with correct priority:
    // 1. For LINK type: always use external_url (ignore file_id)
    // 2. For other types: prefer file_id over external_url
    let downloadUrl: string | null = null;
    
    if (isLinkType) {
      // LINK type: always use external_url
      if (externalUrl) {
        downloadUrl = externalUrl;
      }
      // If LINK type but no external_url, downloadUrl remains null (will show "No file" in UI)
    } else {
      // Non-LINK types: prefer file_id over external_url
      if (fileId) {
        // If file_id exists, use media proxy
        downloadUrl = this.mapDirectusFileToUrl(fileId);
      } else if (externalUrl) {
        // Else if external_url exists, use it
        downloadUrl = externalUrl;
      }
      // Else downloadUrl remains null
    }

    // Validation: Log warnings for invalid resource configurations
    const isVisible = item.visible !== false;
    
    if (isVisible) {
      // For visible resources, exactly one of (file_id, external_url) must be present
      if (!fileId && !externalUrl) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[IVT][CMS] VALIDATION_WARNING: Resource "${item.key}" (id: ${item.id}) is visible but has neither file_id nor external_url`
          );
        }
      } else if (fileId && externalUrl && !isLinkType) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            `[IVT][CMS] VALIDATION_WARNING: Resource "${item.key}" (id: ${item.id}) has both file_id and external_url. Using file_id.`
          );
        }
      }
      
      // Type-specific validation
      if (isLinkType) {
        if (!externalUrl) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[IVT][CMS] VALIDATION_WARNING: Resource "${item.key}" (id: ${item.id}) has type=LINK but no external_url`
            );
          }
        }
        if (fileId) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(
              `[IVT][CMS] VALIDATION_WARNING: Resource "${item.key}" (id: ${item.id}) has type=LINK but also has file_id (should be null)`
            );
          }
        }
      }
    }
    // For non-visible (draft) resources, allow both null

    // Map categories from Directus M2M alias
    // Input: categories?: Array<{ category_id?: { key?: string } }>
    // Output: categories: string[] (array of category keys)
    const categories: string[] = [];
    if (item.categories && Array.isArray(item.categories)) {
      item.categories.forEach((cat: any) => {
        const key = cat?.category_id?.key;
        if (key && typeof key === 'string') {
          categories.push(key);
        }
      });
    }

    // Business rule: Public resources always downloadable (ignore gated flag)
    // Gated non-public resources must NOT expose downloadUrl (especially /api/media/<file_id>)
    const isPublic = categories.includes('public');
    let finalDownloadUrl = downloadUrl;
    
    // If resource is gated AND not public, hide downloadUrl to prevent exposing /api/media/<file_id>
    if (item.gated && !isPublic) {
      finalDownloadUrl = null;
    }

    return {
      id: item.id,
      key: item.key,
      title_de: item.title_de || '',
      title_en: item.title_en || '',
      description_de: item.description_de || null,
      description_en: item.description_en || null,
      type: resourceType,
      kind: item.kind || null,
      file_id: fileId,
      external_url: externalUrl,
      gated: item.gated || false,
      visible: isVisible,
      published_at: item.published_at || null,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      downloadUrl: finalDownloadUrl, // null for gated non-public resources
      externalUrl,
      categories: categories.length > 0 ? categories : undefined,
    };
  }

  async getResourcesByProjectId(projectId: string): Promise<Resource[]> {
    try {
      // Get resources linked to this project via resources_projects junction
      // Use nested fields to get the full resource object with explicit fields
      // Ensure type, kind, file_id, external_url, gated are included
      const endpoint = `/items/resources_projects?filter[project_id][_eq]=${encodeURIComponent(projectId)}&fields=resource_id.id,resource_id.key,resource_id.title_de,resource_id.title_en,resource_id.description_de,resource_id.description_en,resource_id.type,resource_id.kind,resource_id.file_id,resource_id.external_url,resource_id.visible,resource_id.gated,resource_id.published_at,resource_id.createdAt,resource_id.updatedAt,resource_id.categories.category_id.key`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const junctions = response.data || [];
      
      // Extract resources from junction rows and filter visible ones
      const junctionsArray = Array.isArray(junctions) ? junctions : (junctions ? [junctions] : []);
      const resources = junctionsArray
        .map((junction: any) => junction.resource_id)
        .filter((resource: any) => resource && resource.visible !== false)
        .map((item: DirectusItem) => this.mapDirectusResource(item));

      if (process.env.NODE_ENV === 'development') {
        const token = getDirectusToken();
        console.log(`[IVT][CMS] source=DIRECTUS url=${this.baseUrl} tokenLen=${token?.length || 0} fn=getResourcesByProjectId count=${resources.length}`);
      }

      return resources;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getResourcesByProjectId error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return [];
    }
  }

  async getResourcesByProjectSlug(slug: string): Promise<Resource[]> {
    try {
      // First, get the project ID by slug
      const projectEndpoint = `/items/projects?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1&fields=id`;
      const projectResponse = await this.fetchDirectus<DirectusResponse<DirectusItem>>(projectEndpoint);
      const projects = Array.isArray(projectResponse.data) ? projectResponse.data : (projectResponse.data ? [projectResponse.data] : []);
      if (projects.length === 0 || !projects[0]?.id) {
        return [];
      }
      const projectId = projects[0].id;

      // Use the new method that queries junction table directly
      return this.getResourcesByProjectId(projectId);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getResourcesByProjectSlug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return [];
    }
  }

  async getPublicResources(): Promise<Resource[]> {
    try {
      // Use Directus M2M alias 'categories' to filter resources with category key='public'
      // A resource is "public" if it has at least one category with key='public' (even if it also has 'project')
      const endpoint = `/items/resources?filter[visible][_eq]=true&filter[categories][category_id][key][_eq]=public&fields=id,key,title_de,title_en,description_de,description_en,type,kind,file_id,external_url,visible,gated,published_at,createdAt,updatedAt,categories.category_id.key&sort=-published_at&limit=-1`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const dataArray = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      
      const resources = dataArray
        .filter((item: DirectusItem): item is DirectusItem => item != null)
        .map((item: DirectusItem) => this.mapDirectusResource(item));

      if (process.env.NODE_ENV === 'development') {
        const token = getDirectusToken();
        console.log(`[IVT][CMS] source=DIRECTUS url=${this.baseUrl} tokenLen=${token?.length || 0} fn=getPublicResources count=${resources.length}`);
      }

      return resources;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getPublicResources error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return [];
    }
  }

  async getResourcesCountsByProject(): Promise<{ raw: any; countsByProjectId: Record<string, number> }> {
    try {
      // Use aggregation to count resources per project
      const endpoint = `/items/resources_projects?aggregate[count]=*&groupBy[]=project_id`;
      const response = await this.fetchDirectus<any>(endpoint);
      
      // Robust parsing: handle various Directus response formats
      const countsByProjectId: Record<string, number> = {};
      const rows = response.data || [];
      
      rows.forEach((row: any) => {
        const pid = row.project_id;
        if (!pid) return;
        
        // Try multiple possible count field locations
        const c =
          row.count ??
          row.count?.['*'] ??
          row.count?.id ??
          row.count?.resource_id ??
          row.count?.project_id ??
          row?.['count(*)'] ??
          0;
        
        // Convert to number safely
        const n = typeof c === 'number' ? c : Number(c ?? 0);
        countsByProjectId[pid] = Number.isFinite(n) ? n : 0;
      });

      const uniqueProjects = new Set(Object.keys(countsByProjectId)).size;
      
      if (process.env.NODE_ENV === 'development') {
        const token = getDirectusToken();
        console.log(`[IVT][CMS] source=DIRECTUS url=${this.baseUrl} tokenLen=${token?.length || 0} fn=getResourcesCountsByProject rows=${rows.length} uniqueProjects=${uniqueProjects}`);
      }

      return {
        raw: response,
        countsByProjectId,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getResourcesCountsByProject error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return {
        raw: null,
        countsByProjectId: {},
      };
    }
  }

  /**
   * Get CMS page by slug
   * @param slug - Page slug
   * @returns Page or undefined if not found
   * 
   * Note: Only requests whitelisted fields to avoid 403 errors.
   * Does NOT request createdAt/updatedAt as they may not be accessible.
   */
  async getPageBySlug(slug: string): Promise<CmsPage | undefined> {
    try {
      // Only request whitelisted fields (no createdAt/updatedAt to avoid 403)
      const endpoint = `/items/pages?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1&fields=id,slug,title_de,title_en,content_de,content_en,published_at`;
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem>>(endpoint);
      const items = Array.isArray(response.data) ? response.data : (response.data ? [response.data] : []);
      const item = items[0];
      
      if (!item) {
        return undefined;
      }

      return {
        id: item.id,
        slug: item.slug || '',
        title_de: item.title_de || '',
        title_en: item.title_en || '',
        content_de: item.content_de || '',
        content_en: item.content_en || '',
        published_at: item.published_at || null,
        createdAt: new Date().toISOString(), // Default value (not from Directus)
        updatedAt: new Date().toISOString(), // Default value (not from Directus)
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getPageBySlug error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return undefined;
    }
  }

  /**
   * Get site settings (singleton)
   * @returns Site settings or null if not found
   * 
   * Note: Directus singletons return { data: {...} } (object), NOT { data: [...] } (array).
   * 
   * Example JSON structure:
   * {
   *   "id": "1",
   *   "header_menu": [{ "label_de": "...", "label_en": "...", "href": "/...", "visible": true }],
   *   "footer_menu": [{ "label_de": "...", "label_en": "...", "href": "/...", "visible": true }],
   *   "footer_sections": [
   *     { "key": "navigation", "title_de": "Navigation", "title_en": "Navigation", "hrefs": ["/", "/about"] },
   *     { "key": "resources", "title_de": "Ressourcen", "title_en": "Resources", "hrefs": ["/news", "/events"] }
   *   ],
   *   "footer_copyright": { "de": "© 2024 ...", "en": "© 2024 ..." }
   * }
   */
  async getSiteSettings(): Promise<SiteSettings | null> {
    try {
      const endpoint = `/items/site_settings?fields=id,header_menu,footer_menu,footer_sections,footer_copyright`;
      // For singletons, Directus may return { data: {...} } or { data: [...] }
      // Handle both cases
      const response = await this.fetchDirectus<DirectusResponse<DirectusItem> | { data: DirectusItem }>(endpoint);
      
      // Handle singleton response: { data: {...} }
      let item: DirectusItem | undefined;
      if (Array.isArray(response.data)) {
        // Array response (fallback)
        item = response.data[0];
      } else if (response.data && typeof response.data === 'object') {
        // Singleton object response
        item = response.data as DirectusItem;
      }
      
      if (!item || !item.id) {
        return null;
      }

      return {
        id: item.id,
        header_menu: item.header_menu || [],
        footer_menu: item.footer_menu || [],
        footer_sections: item.footer_sections || undefined,
        footer_copyright: item.footer_copyright || undefined,
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][CMS] getSiteSettings error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
      return null;
    }
  }
}

export const directusContentService = new DirectusContentService();
