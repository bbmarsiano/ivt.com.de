#!/usr/bin/env node

/**
 * Seed Directus CMS with mock data from lib/mock/*
 * Upserts items into Directus collections (projects, events, news, testimonials)
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { mockProjects } from '../lib/mock/projects';
import { mockEvents } from '../lib/mock/events';
import { mockNews } from '../lib/mock/news';
import { mockTestimonials } from '../lib/mock/testimonials';
import { mockPartners, mockTeam, mockAboutContent, mockResourceCategories, mockResources, mockResourceProjectLinks, mockResourceCategoryLinks } from '../lib/data/mock-data';

// Load .env.directus explicitly
const envPath = path.join(__dirname, '..', '.env.directus');
dotenv.config({ path: envPath });

const DIRECTUS_URL = process.env.DIRECTUS_URL || 'http://localhost:8055';
const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

if (!DIRECTUS_TOKEN) {
  console.error('Error: DIRECTUS_TOKEN must be set in .env.directus');
  process.exit(1);
}

interface SeedResult {
  created: number;
  updated: number;
  filesUploaded?: number; // For resources seeding
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DIRECTUS_TOKEN}`,
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error (${response.status}) at ${url}: ${error}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function findItemBySlug(collection: string, slug: string) {
  try {
    const response = await fetchAPI(`/items/${collection}?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`);
    const items = response?.data || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    return null;
  }
}

async function findItemByKey(collection: string, key: string) {
  try {
    const response = await fetchAPI(`/items/${collection}?filter[key][_eq]=${encodeURIComponent(key)}&limit=1`);
    const items = response?.data || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Upload a file to Directus and return the file ID
 * @param filePath Local file path (relative to project root or absolute)
 * @returns Directus file ID (UUID) or null if upload fails
 */
async function uploadFileToDirectus(filePath: string): Promise<string | null> {
  try {
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.join(__dirname, '..', filePath);
    
    if (!fs.existsSync(absolutePath)) {
      console.warn(`  ⚠ File not found: ${filePath}`);
      return null;
    }

    const fileBuffer = fs.readFileSync(absolutePath);
    const fileName = path.basename(absolutePath);
    const fileExtension = path.extname(absolutePath).toLowerCase();
    
    // Determine MIME type based on extension
    const mimeTypes: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.ppt': 'application/vnd.ms-powerpoint',
      '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.txt': 'text/plain',
      '.csv': 'text/csv',
    };
    const contentType = mimeTypes[fileExtension] || 'application/octet-stream';

    // Create FormData for multipart upload (Node.js 18+ has FormData)
    const formData = new FormData();
    const blob = new Blob([fileBuffer], { type: contentType });
    formData.append('file', blob, fileName);

    // Upload file via Directus /files endpoint
    const url = `${DIRECTUS_URL}/files`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DIRECTUS_TOKEN}`,
        // Don't set Content-Type - fetch will set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      console.warn(`  ⚠ Failed to upload ${fileName}: ${response.status} - ${error}`);
      return null;
    }

    const result = await response.json();
    const fileId = result.data?.id || result.id;
    
    if (fileId) {
      console.log(`  📎 Uploaded file: ${fileName} → ${fileId}`);
      return fileId;
    }

    return null;
  } catch (error: any) {
    console.warn(`  ⚠ Error uploading file ${filePath}: ${error.message}`);
    return null;
  }
}

async function findTestimonial(companyName: string, authorName: string, quoteDe: string) {
  try {
    // Search by company_name and author_name, then match quote_de (first 100 chars for stability)
    const quotePrefix = quoteDe.substring(0, 100);
    const response = await fetchAPI(
      `/items/testimonials?filter[company_name][_eq]=${encodeURIComponent(companyName)}&filter[author_name][_eq]=${encodeURIComponent(authorName)}&limit=10`
    );
    const items = response?.data || [];
    // Find exact match by quote_de prefix
    return items.find((item: any) => item.quote_de?.substring(0, 100) === quotePrefix) || null;
  } catch (error) {
    return null;
  }
}

async function upsertItem(collection: string, data: any, findFn: () => Promise<any>) {
  const existing = await findFn();

  if (existing) {
    // Update existing item
    await fetchAPI(`/items/${collection}/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return 'updated';
  } else {
    // Create new item
    await fetchAPI(`/items/${collection}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return 'created';
  }
}

function mapProjectToDirectus(project: any) {
  // Directus JSON fields expect JSON strings, not objects
  return {
    slug: project.slug,
    status: project.status,
    industry: project.industry,
    title_de: project.title_de,
    title_en: project.title_en,
    summary_de: project.summary_de,
    summary_en: project.summary_en,
    description_de: project.description_de,
    description_en: project.description_en,
    thumbnail: project.thumbnail,
    images: project.images || [],
    tags: project.tags || [],
    featured: project.featured || false,
    coordinator: project.coordinator || {},
    metrics: project.metrics || null,
    eligibility_de: project.eligibility_de || [],
    eligibility_en: project.eligibility_en || [],
    documents: project.documents || [],
    createdAt: project.createdAt ? new Date(project.createdAt + 'T00:00:00Z').toISOString() : new Date().toISOString(),
  };
}

function mapEventToDirectus(event: any) {
  return {
    slug: event.slug,
    title_de: event.title_de,
    title_en: event.title_en,
    description_de: event.description_de,
    description_en: event.description_en,
    location: event.location,
    start_at: event.start_at, // Already ISO string
    end_at: event.end_at, // Already ISO string
    cover: event.cover || null,
  };
}

function mapNewsToDirectus(news: any) {
  return {
    slug: news.slug,
    title_de: news.title_de,
    title_en: news.title_en,
    summary_de: news.summary_de,
    summary_en: news.summary_en,
    published_at: news.published_at, // Already ISO string
    cover: news.cover || null,
    tags: news.tags || [],
  };
}

function mapTestimonialToDirectus(testimonial: any) {
  return {
    quote_de: testimonial.quote_de,
    quote_en: testimonial.quote_en,
    author_name: testimonial.author_name,
    author_title_de: testimonial.author_title_de,
    author_title_en: testimonial.author_title_en,
    company_name: testimonial.company_name,
    company_logo: testimonial.company_logo || null,
    featured: testimonial.featured || false,
  };
}

function mapPartnerToDirectus(partner: any) {
  return {
    name: partner.name,
    logo: partner.logo || null,
    website: partner.website || null,
  };
}

function mapTeamMemberToDirectus(member: any) {
  return {
    slug: member.slug,
    first_name: member.first_name,
    last_name: member.last_name,
    role_de: member.role_de,
    role_en: member.role_en,
    bio_de: member.bio_de,
    bio_en: member.bio_en,
    email: member.email || null,
    linkedin: member.linkedin || null,
    avatar_file: member.avatar_file || null,
    sort: member.sort || 0,
    featured: member.featured || false,
  };
}

async function seedProjects(): Promise<SeedResult> {
  console.log('\n📦 Seeding projects...');
  let created = 0;
  let updated = 0;

  for (const project of mockProjects) {
    const data = mapProjectToDirectus(project);
    const result = await upsertItem('projects', data, () => findItemBySlug('projects', project.slug));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${project.slug}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${project.slug}`);
    }
  }

  return { created, updated };
}

async function seedEvents(): Promise<SeedResult> {
  console.log('\n📅 Seeding events...');
  let created = 0;
  let updated = 0;

  for (const event of mockEvents) {
    const data = mapEventToDirectus(event);
    const result = await upsertItem('events', data, () => findItemBySlug('events', event.slug));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${event.slug}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${event.slug}`);
    }
  }

  return { created, updated };
}

async function seedNews(): Promise<SeedResult> {
  console.log('\n📰 Seeding news...');
  let created = 0;
  let updated = 0;

  for (const news of mockNews) {
    const data = mapNewsToDirectus(news);
    const result = await upsertItem('news', data, () => findItemBySlug('news', news.slug));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${news.slug}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${news.slug}`);
    }
  }

  return { created, updated };
}

async function seedTestimonials(): Promise<SeedResult> {
  console.log('\n💬 Seeding testimonials...');
  let created = 0;
  let updated = 0;

  for (const testimonial of mockTestimonials) {
    const data = mapTestimonialToDirectus(testimonial);
    const result = await upsertItem('testimonials', data, () =>
      findTestimonial(testimonial.company_name, testimonial.author_name, testimonial.quote_de)
    );
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${testimonial.company_name} - ${testimonial.author_name}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${testimonial.company_name} - ${testimonial.author_name}`);
    }
  }

  return { created, updated };
}

async function seedPartners(): Promise<SeedResult> {
  console.log('\n🤝 Seeding partners...');
  let created = 0;
  let updated = 0;

  for (const partner of mockPartners) {
    const data = mapPartnerToDirectus(partner);
    const result = await upsertItem('partners', data, () => findPartnerByName(partner.name));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${partner.name}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${partner.name}`);
    }
  }

  return { created, updated };
}

async function findPartnerByName(name: string) {
  try {
    const response = await fetchAPI(`/items/partners?filter[name][_eq]=${encodeURIComponent(name)}&limit=1`);
    const items = response?.data || [];
    return items.length > 0 ? items[0] : null;
  } catch (error) {
    return null;
  }
}

async function seedTeam(): Promise<SeedResult> {
  console.log('\n👥 Seeding team...');
  let created = 0;
  let updated = 0;

  for (const member of mockTeam) {
    const data = mapTeamMemberToDirectus(member);
    const result = await upsertItem('team', data, () => findTeamMemberBySlugOrName(member.slug, member.first_name, member.last_name));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${member.first_name} ${member.last_name}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${member.first_name} ${member.last_name}`);
    }
  }

  return { created, updated };
}

async function findTeamMemberBySlugOrName(slug: string, firstName: string, lastName: string) {
  try {
    // Try slug first (preferred)
    const slugResponse = await fetchAPI(`/items/team?filter[slug][_eq]=${encodeURIComponent(slug)}&limit=1`);
    const slugItems = slugResponse?.data || [];
    if (slugItems.length > 0) {
      return slugItems[0];
    }
    
    // Fallback to first_name + last_name
    const nameResponse = await fetchAPI(
      `/items/team?filter[first_name][_eq]=${encodeURIComponent(firstName)}&filter[last_name][_eq]=${encodeURIComponent(lastName)}&limit=1`
    );
    const nameItems = nameResponse?.data || [];
    return nameItems.length > 0 ? nameItems[0] : null;
  } catch (error) {
    return null;
  }
}

async function seedAbout(): Promise<SeedResult> {
  console.log('\n📄 Seeding about (singleton)...');
  let created = 0;
  let updated = 0;

  try {
    // Fetch existing about singleton
    const existingResponse = await fetchAPI('/items/about?limit=1&fields=id');
    const existingItems = existingResponse?.data || [];
    
    const data = {
      title_de: mockAboutContent.title_de,
      title_en: mockAboutContent.title_en,
      intro_de: mockAboutContent.intro_de,
      intro_en: mockAboutContent.intro_en,
      mission_de: mockAboutContent.mission_de,
      mission_en: mockAboutContent.mission_en,
      vision_de: mockAboutContent.vision_de,
      vision_en: mockAboutContent.vision_en,
      updatedAt: new Date().toISOString(),
    };

    if (existingItems.length > 0) {
      // Update existing
      const existingId = existingItems[0].id;
      await fetchAPI(`/items/about/${existingId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
      updated++;
      console.log(`  ✓ Updated: about singleton`);
    } else {
      // Create new
      await fetchAPI('/items/about', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      created++;
      console.log(`  ✓ Created: about singleton`);
    }
  } catch (error: any) {
    console.error(`  ✗ Error seeding about: ${error.message}`);
  }

  return { created, updated };
}

async function seedResourceCategories(): Promise<SeedResult> {
  console.log('\n📂 Seeding resource categories...');
  let created = 0;
  let updated = 0;

  for (const category of mockResourceCategories) {
    const data = {
      key: category.key,
      title_de: category.title_de,
      title_en: category.title_en,
      sort: category.sort,
    };
    const result = await upsertItem('resource_categories', data, () => findItemByKey('resource_categories', category.key));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${category.key}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${category.key}`);
    }
  }

  return { created, updated };
}

async function seedResources(): Promise<SeedResult> {
  console.log('\n📎 Seeding resources...');
  let created = 0;
  let updated = 0;
  let filesUploaded = 0;

  for (const resource of mockResources) {
    let fileId = resource.file_id || null;
    let externalUrl = resource.external_url || null;

    // Check if mock resource has a filePath property (for file upload)
    // This would be added to mock data if needed
    const resourceWithFilePath = resource as any;
    if (resourceWithFilePath.filePath && !fileId) {
      // Upload file and get file_id
      const uploadedFileId = await uploadFileToDirectus(resourceWithFilePath.filePath);
      if (uploadedFileId) {
        fileId = uploadedFileId;
        externalUrl = null; // Clear external_url when file_id is set
        filesUploaded++;
      }
    }

    // Ensure exactly one of (file_id, external_url) is set for visible resources
    // For type='LINK', require external_url
    if (resource.visible !== false) {
      if (resource.type === 'LINK') {
        // LINK type: require external_url, file_id must be null
        if (!externalUrl) {
          console.warn(`  ⚠ Resource "${resource.key}" has type=LINK but no external_url`);
        }
        fileId = null; // Ensure file_id is null for LINK type
      } else {
        // Other types: prefer file_id if available, else use external_url
        if (fileId && externalUrl) {
          // Both set: prefer file_id, clear external_url
          console.log(`  💡 Resource "${resource.key}" has both file_id and external_url, using file_id`);
          externalUrl = null;
        } else if (!fileId && !externalUrl) {
          console.warn(`  ⚠ Resource "${resource.key}" is visible but has neither file_id nor external_url`);
        }
      }
    }

    const data = {
      key: resource.key,
      title_de: resource.title_de,
      title_en: resource.title_en,
      description_de: resource.description_de || null,
      description_en: resource.description_en || null,
      type: resource.type,
      file_id: fileId,
      external_url: externalUrl,
      gated: resource.gated || false,
      visible: resource.visible !== false,
      published_at: resource.published_at || null,
    };
    const result = await upsertItem('resources', data, () => findItemByKey('resources', resource.key));
    if (result === 'created') {
      created++;
      console.log(`  ✓ Created: ${resource.key}${fileId ? ' (with file)' : externalUrl ? ' (with external URL)' : ''}`);
    } else {
      updated++;
      console.log(`  ✓ Updated: ${resource.key}${fileId ? ' (with file)' : externalUrl ? ' (with external URL)' : ''}`);
    }
  }

  return { created, updated, filesUploaded };
}

async function seedResourcesCategories(): Promise<SeedResult> {
  console.log('\n🔗 Seeding resources_categories junction...');
  let created = 0;
  let updated = 0;

  // Get all categories by key
  const categoryMap = new Map<string, string>();
  for (const category of mockResourceCategories) {
    const existing = await findItemByKey('resource_categories', category.key);
    if (existing) {
      categoryMap.set(category.key, existing.id);
    }
  }

  // Get all resources by key
  const resourceMap = new Map<string, string>();
  for (const resource of mockResources) {
    const existing = await findItemByKey('resources', resource.key);
    if (existing) {
      resourceMap.set(resource.key, existing.id);
    }
  }

  // Create junction entries
  for (const [resourceKey, categoryKeys] of Object.entries(mockResourceCategoryLinks)) {
    const resourceId = resourceMap.get(resourceKey);
    if (!resourceId) continue;

    for (const categoryKey of categoryKeys) {
      const categoryId = categoryMap.get(categoryKey);
      if (!categoryId) continue;

      try {
        // Check if junction entry exists
        const existingResponse = await fetchAPI(
          `/items/resources_categories?filter[resource_id][_eq]=${encodeURIComponent(resourceId)}&filter[category_id][_eq]=${encodeURIComponent(categoryId)}&limit=1`
        );
        const existing = existingResponse?.data || [];

        if (existing.length === 0) {
          // Create junction entry
          await fetchAPI('/items/resources_categories', {
            method: 'POST',
            body: JSON.stringify({
              resource_id: resourceId,
              category_id: categoryId,
            }),
          });
          created++;
        } else {
          updated++;
        }
      } catch (error: any) {
        console.error(`  ✗ Error creating junction ${resourceKey} -> ${categoryKey}: ${error.message}`);
      }
    }
  }

  return { created, updated };
}

async function seedResourcesProjects(): Promise<SeedResult> {
  console.log('\n🔗 Seeding resources_projects junction...');
  let created = 0;
  let updated = 0;

  // Get all projects by slug
  const projectMap = new Map<string, string>();
  for (const project of mockProjects) {
    const existing = await findItemBySlug('projects', project.slug);
    if (existing) {
      projectMap.set(project.slug, existing.id);
    }
  }

  // Get all resources by key
  const resourceMap = new Map<string, string>();
  for (const resource of mockResources) {
    const existing = await findItemByKey('resources', resource.key);
    if (existing) {
      resourceMap.set(resource.key, existing.id);
    }
  }

  // Create junction entries
  for (const [resourceKey, projectSlugs] of Object.entries(mockResourceProjectLinks)) {
    const resourceId = resourceMap.get(resourceKey);
    if (!resourceId) continue;

    for (const projectSlug of projectSlugs) {
      const projectId = projectMap.get(projectSlug);
      if (!projectId) continue;

      try {
        // Check if junction entry exists
        const existingResponse = await fetchAPI(
          `/items/resources_projects?filter[resource_id][_eq]=${encodeURIComponent(resourceId)}&filter[project_id][_eq]=${encodeURIComponent(projectId)}&limit=1`
        );
        const existing = existingResponse?.data || [];

        if (existing.length === 0) {
          // Create junction entry
          await fetchAPI('/items/resources_projects', {
            method: 'POST',
            body: JSON.stringify({
              resource_id: resourceId,
              project_id: projectId,
            }),
          });
          created++;
        } else {
          updated++;
        }
      } catch (error: any) {
        console.error(`  ✗ Error creating junction ${resourceKey} -> ${projectSlug}: ${error.message}`);
      }
    }
  }

  return { created, updated };
}

async function main() {
  console.log('🌱 Seeding Directus CMS with mock data...\n');
  console.log(`Directus URL: ${DIRECTUS_URL}`);
  console.log(`Token: ${DIRECTUS_TOKEN!.substring(0, 10)}... (hidden)\n`);

  try {
    const projectsResult = await seedProjects();
    const eventsResult = await seedEvents();
    const newsResult = await seedNews();
    const testimonialsResult = await seedTestimonials();
    const partnersResult = await seedPartners();
    const teamResult = await seedTeam();
    const aboutResult = await seedAbout();
    const resourceCategoriesResult = await seedResourceCategories();
    const resourcesResult = await seedResources();
    const resourcesCategoriesResult = await seedResourcesCategories();
    const resourcesProjectsResult = await seedResourcesProjects();

    console.log('\n✅ Seeding complete!\n');
    console.log('Summary:');
    console.log(`  projects: ${projectsResult.created} created, ${projectsResult.updated} updated`);
    console.log(`  events: ${eventsResult.created} created, ${eventsResult.updated} updated`);
    console.log(`  news: ${newsResult.created} created, ${newsResult.updated} updated`);
    console.log(`  testimonials: ${testimonialsResult.created} created, ${testimonialsResult.updated} updated`);
    console.log(`  partners: ${partnersResult.created} created, ${partnersResult.updated} updated`);
    console.log(`  team: ${teamResult.created} created, ${teamResult.updated} updated`);
    console.log(`  about: ${aboutResult.created} created, ${aboutResult.updated} updated`);
    console.log(`  resource_categories: ${resourceCategoriesResult.created} created, ${resourceCategoriesResult.updated} updated`);
    console.log(`  resources: ${resourcesResult.created} created, ${resourcesResult.updated} updated${resourcesResult.filesUploaded ? `, ${resourcesResult.filesUploaded} files uploaded` : ''}`);
    console.log(`  resources_categories: ${resourcesCategoriesResult.created} created, ${resourcesCategoriesResult.updated} updated`);
    console.log(`  resources_projects: ${resourcesProjectsResult.created} created, ${resourcesProjectsResult.updated} updated`);
    console.log('\n💡 Verify in Directus UI: http://localhost:8055 → Content');
  } catch (error: any) {
    console.error('\n❌ Error seeding:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();
