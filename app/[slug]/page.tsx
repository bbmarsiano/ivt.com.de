/**
 * Dynamic CMS Page Route
 * 
 * Handles CMS pages from Directus (e.g., /privacy-policy, /terms-of-service)
 * 
 * IMPORTANT: This route does NOT shadow existing routes like /projects, /news, etc.
 * A denylist ensures existing routes take precedence.
 * 
 * Verification:
 * 1. Create a page in Directus with slug "test-page"
 * 2. Visit http://localhost:3000/test-page
 * 3. Should render page content (or 404 if not found)
 * 
 * Directus API test:
 * curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
 *   "http://localhost:8055/items/pages?filter[slug][_eq]=test-page&fields=id,slug,title_de,title_en,content_de,content_en,published_at" | jq
 */

import { notFound } from 'next/navigation';
import { contentService } from '@/services/contentService';
import { CmsPageClient } from '@/components/cms/CmsPageClient';

// Denylist: existing top-level routes and system/static assets that should NOT be handled by CMS pages
// 
// We intentionally denylist static assets (favicon.ico, robots.txt, etc.) because:
// - Next.js/static asset requests may hit this dynamic route
// - These should be handled by Next.js static file serving or app/favicon.ico
// - When a real favicon is added later (app/favicon.ico or public/favicon.ico), Next will handle it
// - This prevents unnecessary Directus API calls for system files
const ROUTE_DENYLIST = new Set([
  // Existing app routes
  'about',
  'admin',
  'api',
  'apply',
  'contact',
  'events',
  'goals',
  'impact',
  'imprint',
  'news',
  'partners',
  'privacy',
  'projects',
  'resources',
  'why-now',
  'why-thuringia',
  // System/static assets
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'sw.js',
  'browserconfig.xml',
]);

interface CmsPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;

  // Check denylist: if slug matches an existing route, return 404
  if (ROUTE_DENYLIST.has(slug)) {
    notFound();
  }

  // Fetch page from Directus
  const page = await contentService.getPageBySlugAsync(slug);

  if (!page) {
    notFound();
  }

  // Check if page is published (if published_at is set, it must be in the past)
  // In development, allow pages with null published_at
  if (page.published_at) {
    const publishedDate = new Date(page.published_at);
    const now = new Date();
    if (publishedDate > now) {
      notFound(); // Page not yet published
    }
  } else if (process.env.NODE_ENV === 'production') {
    // In production, require published_at to be set
    notFound(); // Page not published
  }
  // In development, allow pages without published_at

  // Render page with localized content
  return <CmsPageClient page={page} />;
}
