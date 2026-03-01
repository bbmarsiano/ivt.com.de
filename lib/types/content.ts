/**
 * Shared content types for the application
 */

export type Locale = 'de' | 'en';

/**
 * CMS Page (from Directus pages collection)
 */
export interface CmsPage {
  id: string;
  slug: string;
  title_de: string;
  title_en: string;
  content_de: string; // HTML content
  content_en: string; // HTML content
  published_at?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Site Settings (from Directus site_settings singleton)
 */
export interface SiteSettings {
  id: string;
  header_menu?: MenuItem[];
  footer_menu?: MenuItem[];
  footer_sections?: FooterSection[]; // Optional: grouped footer sections with localized titles
  footer_copyright?: FooterCopyright; // Optional: localized copyright text
}

/**
 * Menu item structure
 */
export interface MenuItem {
  label_de: string;
  label_en: string;
  href: string;
  visible?: boolean;
}

/**
 * Footer section with grouped links
 */
export interface FooterSection {
  key: string; // Unique identifier for the section
  title_de: string;
  title_en: string;
  hrefs: string[]; // Array of hrefs that should appear in this section (matched against footer_menu)
}

/**
 * Footer copyright text (bilingual)
 */
export interface FooterCopyright {
  de: string;
  en: string;
}

export type ProjectStatus = 'ongoing' | 'completed';
export type ProjectIndustry = 'tech' | 'manufacturing' | 'green_energy' | 'defense' | 'other';

export interface ProjectCoordinator {
  name: string;
  title: {
    de: string;
    en: string;
  };
  email: string;
  phone: string;
  avatar?: string;
}

export interface ProjectMetrics {
  budget?: string;
  duration?: string;
  partners?: number;
  jobs?: number;
}

export interface ProjectDocument {
  id: string;
  filename: string;
  type: string;
  size: string;
}

export interface Project {
  id: string;
  slug: string;
  status: ProjectStatus;
  industry: ProjectIndustry;
  title_de: string;
  title_en: string;
  summary_de: string;
  summary_en: string;
  description_de: string;
  description_en: string;
  thumbnail: string;
  images: string[];
  tags: string[];
  featured: boolean;
  coordinator: ProjectCoordinator;
  metrics?: ProjectMetrics;
  eligibility_de: string[];
  eligibility_en: string[];
  documents: ProjectDocument[];
  createdAt: string;
  resourcesCount?: number;
}

export type ResourceType = 'PDF' | 'DOC' | 'PPT' | 'LINK' | 'OTHER';

export interface ResourceCategory {
  id: string;
  key: string;
  title_de: string;
  title_en: string;
  sort: number;
}

export interface Resource {
  id: string;
  key: string;
  title_de: string;
  title_en: string;
  description_de?: string | null;
  description_en?: string | null;
  type: ResourceType;
  /**
   * High-level kind used for /resources categorization
   * e.g. "document" | "video" | "download" | "guide"
   */
  kind?: string | null;
  file_id?: string | null;
  external_url?: string | null;
  gated: boolean;
  visible: boolean;
  published_at?: string | null;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  downloadUrl?: string | null;
  externalUrl?: string | null;
  categories?: string[]; // Array of category keys (e.g., ["public", "project"])
}

export interface Testimonial {
  id: string;
  quote_de: string;
  quote_en: string;
  author_name: string;
  author_title_de: string;
  author_title_en: string;
  company_name: string;
  company_logo?: string;
  featured: boolean;
}

export interface NewsPost {
  id: string;
  slug: string;
  title_de: string;
  title_en: string;
  summary_de: string;
  summary_en: string;
  published_at: string;
  cover?: string;
  tags: string[];
}

export interface EventItem {
  id: string;
  slug: string;
  title_de: string;
  title_en: string;
  description_de: string;
  description_en: string;
  location: string;
  start_at: string;
  end_at: string;
  cover?: string;
}

export interface Partner {
  id: string;
  name: string;
  logo?: string;
  website?: string;
}

export interface TeamMember {
  id: string;
  slug: string;
  first_name: string;
  last_name: string;
  role_de: string;
  role_en: string;
  bio_de: string;
  bio_en: string;
  email?: string;
  linkedin?: string;
  avatarFile?: string | null; // Raw Directus file UUID
  avatarUrl?: string | null; // Computed URL for rendering
  sort: number;
  featured: boolean;
  createdAt: string;
}

export interface AboutContent {
  id: string;
  title_de: string;
  title_en: string;
  intro_de: string;
  intro_en: string;
  mission_de: string;
  mission_en: string;
  vision_de: string;
  vision_en: string;
  heroImageFile?: string | null; // Raw Directus file UUID
  heroImageUrl?: string | null; // Computed URL for rendering
  createdAt: string;
  updatedAt: string;
}
