# Connecting Frontend to Directus

This guide explains how to enable Directus as the content source for the Next.js frontend.

## Overview

The `contentService` has been enhanced to support Directus as an optional content source, with automatic fallback to mock data. This allows gradual migration without breaking existing functionality.

## Architecture

- **Server-Only**: Directus integration is server-only (never runs in browser)
- **Feature Flag**: Controlled by `USE_DIRECTUS` environment variable
- **Automatic Fallback**: If Directus fails or is disabled, falls back to mock data
- **No Breaking Changes**: Existing synchronous methods continue to work with mocks

## Setup

### 1. Environment Variables

Add to `.env.local`:

```env
# Enable Directus integration (0 = disabled, 1 = enabled)
USE_DIRECTUS=0

# Directus URL
DIRECTUS_URL=http://localhost:8055

# Directus token (server-side only, never exposed to browser)
# Optional: If not set, will try public role access
DIRECTUS_TOKEN=your-admin-token-here
```

**Security Notes:**
- `DIRECTUS_TOKEN` is server-only and never sent to the browser
- If token is missing, the service will attempt unauthenticated requests (public role)
- For production, use a server-side token with read-only permissions

### 2. Enable Directus Mode

Set `USE_DIRECTUS=1` in `.env.local`:

```env
USE_DIRECTUS=1
```

### 3. Verify Directus is Running

```bash
# Check Directus container
docker-compose -f docker/docker-compose.directus.yml ps

# Check Directus API
curl http://localhost:8055/server/info
```

### 4. Verify Content is Seeded

```bash
# Run seed if not already done
npm run directus:seed

# Verify via API
curl -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  http://localhost:8055/items/projects?limit=1
```

## Usage

### Current Implementation (Client Components)

The existing pages (`app/projects/page.tsx`, `app/projects/[slug]/page.tsx`) are client components that use **synchronous methods**. These continue to work with mock data:

```typescript
// Client component - uses mocks
const projects = contentService.getProjects(filters);
const project = contentService.getProjectBySlug(slug);
```

### Directus Integration (Server Components)

To use Directus, you need to use **async methods** in server components or API routes:

```typescript
// Server component or API route
const projects = await contentService.getProjectsAsync(filters);
const project = await contentService.getProjectBySlugAsync(slug);
```

**Example Server Component:**

```typescript
// app/projects/page.tsx (server component)
import { contentService } from '@/services/contentService';

export default async function ProjectsPage() {
  const projects = await contentService.getProjectsAsync();
  
  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.title_en}</div>
      ))}
    </div>
  );
}
```

## Available Methods

### Synchronous (Mock Data Only)

These methods work in client components but always use mock data:

- `getProjects(filters?)`
- `getProjectBySlug(slug)`
- `getFeaturedProjects()`
- `getAllTestimonials()`
- `getFeaturedTestimonials()`
- `getAllNews()`
- `getLatestNews(limit)`
- `getNewsBySlug(slug)`
- `getAllEvents()`
- `getUpcomingEvents(limit)`
- `getEventBySlug(slug)`

### Async (Directus + Fallback)

These methods use Directus when `USE_DIRECTUS=1`, otherwise fall back to mocks:

- `getProjectsAsync(filters?)`
- `getProjectBySlugAsync(slug)`
- `getFeaturedProjectsAsync()`
- `getAllTestimonialsAsync()`
- `getFeaturedTestimonialsAsync()`
- `getAllNewsAsync()`
- `getLatestNewsAsync(limit)`
- `getNewsBySlugAsync(slug)`
- `getAllEventsAsync()`
- `getUpcomingEventsAsync(limit)`
- `getEventBySlugAsync(slug)`

## How Fallback Works

1. **Check Feature Flag**: If `USE_DIRECTUS` is not `1`, use mocks immediately
2. **Try Directus**: If enabled, attempt to fetch from Directus
3. **Handle Errors**: If Directus fails (network, auth, etc.), log error once and fall back to mocks
4. **Return Data**: Always returns data (either from Directus or mocks)

**Error Handling:**
- Network errors → fallback to mocks
- 401/403 errors → fallback to mocks (with helpful error message)
- Missing token → try public access, fallback if fails
- Any other error → fallback to mocks

## Verification

### 1. Debug Endpoint (Hard Proof)

Use the debug endpoint to definitively verify CMS source:

```bash
curl http://localhost:3000/api/debug/cms | jq
```

This returns:
- `env`: Environment variables (USE_DIRECTUS, DIRECTUS_URL, DIRECTUS_TOKEN_LEN)
- `directusServerInfo`: Directus server info (if accessible)
- `directusProjectsSample`: Sample projects from Directus (if accessible)
- `errors`: Any errors encountered

**Example output when Directus is working:**
```json
{
  "env": {
    "USE_DIRECTUS": "1",
    "DIRECTUS_URL": "http://localhost:8055",
    "DIRECTUS_TOKEN_LEN": 45,
    "NODE_ENV": "development"
  },
  "directusServerInfo": { "directus": { "version": "11.14.1" } },
  "directusProjectsSample": [
    { "id": "...", "slug": "ai-research-hub", "title_en": "..." }
  ],
  "errors": null
}
```

### 2. Check Server Logs

When `USE_DIRECTUS=1`, check server logs for:
- `[IVT][CMS] source=DIRECTUS url=http://localhost:8055 tokenLen=45 fn=getProjectsAsync` - Directus is active
- `[IVT][CMS] source=MOCKS reason=... fn=...` - Using mocks with reason
- `[IVT][CMS] DIRECTUS_FETCH_FAILED fn=... error=...` - Error occurred, fallback active

**Note**: Logs appear on every request (not once per session) to provide real-time visibility.

### 3. Visual Badge (Development Only)

In development mode, a badge appears in the bottom-right corner:
- **Green "CMS: DIRECTUS"** - Using Directus
- **Yellow "CMS: MOCKS"** - Using mocks (with reason on hover)
- **Live title check**: Shows `digital-health: <title_en>` fetched directly from Directus (hard proof)

The badge is server-rendered and only visible in `NODE_ENV=development`.

### 4. Force Dynamic Rendering

The following pages are configured for dynamic rendering (no static caching):
- `app/page.tsx` (Home)
- `app/projects/page.tsx` (Projects listing)
- `app/projects/[slug]/page.tsx` (Project detail)

Each page includes:
```typescript
export const dynamic = 'force-dynamic';
export const revalidate = 0;
```

This ensures content is fetched fresh on every request in development.

### 5. 3-Step Proof Test

**Quick verification that Directus is working:**

1. **Change title in Directus UI:**
   - Open Directus Admin: `http://localhost:8055`
   - Navigate to Content → Projects
   - Edit a project (e.g., "digital-health")
   - Change `title_en` to something unique (e.g., "Digital Health Solutionss")
   - Save

2. **Refresh the page:**
   - Visit `http://localhost:3000/projects`
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)

3. **Verify:**
   - ✅ Updated title appears immediately
   - ✅ Server logs show: `[IVT][CMS] source=DIRECTUS ... fn=getProjectsAsync`
   - ✅ DEV badge shows green "CMS: DIRECTUS"
   - ✅ DEV badge shows live title: `digital-health: Digital Health Solutionss`

**If title doesn't update:**
- Check server logs for errors
- Verify `USE_DIRECTUS=1` in `.env.local`
- Restart dev server: `npm run dev`
- Check debug endpoint: `curl http://localhost:3000/api/debug/cms | jq`

## Permissions

### Option 1: Server-Side Token (Recommended)

Use `DIRECTUS_TOKEN` in `.env.local`:
- Token is server-only, never exposed to browser
- Requires admin or read-only token
- Most secure option

### Option 2: Public Role Access

If `DIRECTUS_TOKEN` is not set:
- Service attempts unauthenticated requests
- Requires public role to have read permissions for CMS collections
- Configure in Directus: Settings → Roles & Permissions → Public → Collections

**To enable public access:**
```bash
# Fix permissions for public role
./scripts/directus-fix-permissions.sh
```

## Troubleshooting

### "Directus authentication failed"

**Error**: `Directus authentication failed (401/403)`

**Solutions:**
1. Check `DIRECTUS_TOKEN` is set correctly in `.env.local`
2. Verify token is valid: `curl -H "Authorization: Bearer $DIRECTUS_TOKEN" http://localhost:8055/server/info`
3. Or configure public role permissions (remove token to use public access)

### "Directus fetch failed, falling back to mocks"

**Error**: Network or API errors

**Solutions:**
1. Check Directus is running: `docker-compose -f docker/docker-compose.directus.yml ps`
2. Check `DIRECTUS_URL` is correct
3. Verify content is seeded: `npm run directus:seed`
4. Check server logs for detailed error

### Content not updating

**Issue**: Changes in Directus not reflected in frontend

**Solutions:**
1. Ensure `USE_DIRECTUS=1` is set in `.env.local`
2. Restart dev server: `npm run dev`
3. Verify pages are server components (not client components)
4. Check server logs for `[IVT][CMS]` messages
5. Verify Directus has the latest content
6. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)
7. Check debug endpoint: `curl http://localhost:3000/api/debug/cms | jq`

### Type mismatches

**Error**: TypeScript errors about field types

**Solutions:**
1. Run type check: `npm run typecheck`
2. Verify Directus schema matches TypeScript types
3. Check JSON fields are properly parsed (arrays/objects, not strings)

## Migration Path

### Phase 1: Current (No Changes)
- All pages use synchronous methods
- All content comes from mocks
- No Directus integration

### Phase 2: Enable Directus (Completed)
- ✅ Add `USE_DIRECTUS=1` to `.env.local`
- ✅ Converted key pages to server components:
  - `app/page.tsx` (Home)
  - `app/projects/page.tsx` (Projects listing)
  - `app/projects/[slug]/page.tsx` (Project detail)
- ✅ Pages fetch from Directus on server, pass data to client components
- ✅ Added per-request logging for visibility
- ✅ Added hard proof UI marker (DEV only)

### Phase 3: Future Enhancements
- Migrate remaining pages (news, events, etc.) to server components
- Add ISR (Incremental Static Regeneration) for production
- Remove mock data dependency entirely

## Partner Logos

### Uploading Partner Logos in Directus

Partners can have logos uploaded directly in Directus:

1. **Upload Logo:**
   - Open Directus Admin: `http://localhost:8055`
   - Navigate to Content → Partners
   - Edit a partner (e.g., "TechCorp")
   - Upload an image in the `logo_file` field
   - Save

2. **Verify Logo URL:**
   - The logo URL will be: `http://localhost:8055/assets/<uuid>`
   - Where `<uuid>` is the Directus file ID

3. **Check Logs:**
   - Refresh `http://localhost:3000/partners`
   - Terminal should show: `[IVT][CMS] partners sample: { name: "TechCorp", logo: "http://localhost:8055/assets/...", logo_file_present: true }`

4. **Fallback Behavior:**
   - If `logo_file` is not set, falls back to `logo` field (if present)
   - If no logo is available, shows a placeholder with the first letter of the partner name
   - Image loading errors automatically fall back to placeholder

### Logo Field Priority

The mapping logic prioritizes:
1. `logo_file` (Directus file FK) - if UUID, converts to `${DIRECTUS_URL}/assets/${uuid}`
2. `logo` field - if UUID, converts to asset URL; if URL/path, uses as-is
3. Placeholder - shows first letter of partner name

## Team CMS

### Database Migration

Apply the team table migration:

```bash
psql "postgresql://dimitarmitrev@localhost:5432/ivt_dev" -v ON_ERROR_STOP=1 -f db/migrations/2026-01-27_cms_team.sql
```

### Restart Directus

After applying the migration, restart Directus to introspect the new table:

```bash
docker-compose -f docker/docker-compose.directus.yml restart
```

### Seed Team Data

Seed team members from mock data:

```bash
npm run directus:seed
```

This will seed team members with slugs, names, roles, bios, and contact information.

### Verify in Directus UI

1. Open Directus Admin: `http://localhost:8055`
2. Navigate to Content → Team
3. Verify team members are visible with all fields

### Verify on Website

1. Visit `http://localhost:3000/about#team`
2. Team section should display all team members
3. Avatars, roles, and bios should render correctly
4. Email and LinkedIn links should work (if provided)

### Team Section Features

- **Sorting**: Team members are sorted by `sort` field (ascending), then by `last_name`
- **Bilingual**: Roles and bios switch based on current language (DE/EN)
- **Avatar Support**: Supports Directus file uploads via `avatar_file` field
- **Contact Links**: Email and LinkedIn links are displayed if provided
- **Fallback**: If avatar fails to load, shows initials (first letter of first and last name)

## About Page Images

### Hero Image

The About page hero image can be edited in Directus:

1. **Upload Hero Image:**
   - Open Directus Admin: `http://localhost:8055`
   - Navigate to Content → About
   - Upload an image in the `hero_image_file` field
   - Save

2. **Field Details:**
   - Field name: `hero_image_file`
   - Type: UUID (FK to `directus_files`)
   - Interface: File Image
   - The image URL will be: `http://localhost:8055/assets/<uuid>`

3. **Fallback Behavior:**
   - If no image is uploaded, the page uses a default fallback image
   - The fallback image URL is defined in `lib/data/mock-data.ts` as `ABOUT_HERO_FALLBACK_IMAGE`

4. **Verify:**
   ```bash
   curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
     "http://localhost:8055/items/about?limit=1&fields=id,title_en,hero_image_file" | jq
   ```

### Team Avatars

Team member avatars can be edited in Directus:

1. **Upload Avatar:**
   - Open Directus Admin: `http://localhost:8055`
   - Navigate to Content → Team
   - Edit a team member
   - Upload an image in the `avatar_file` field
   - Save

2. **Field Details:**
   - Field name: `avatar_file`
   - Type: UUID (FK to `directus_files`)
   - Interface: File Image
   - The image URL will be: `http://localhost:8055/assets/<uuid>`

3. **Fallback Behavior:**
   - If no avatar is uploaded, shows initials (first letter of first and last name)

4. **Verify:**
   ```bash
   curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
     "http://localhost:8055/items/team?limit=1&fields=id,first_name,last_name,avatar_file" | jq
   ```

### Fixing File Field Metadata

If file fields are not showing correctly in Directus UI, run:

```bash
node scripts/directus-fix-file-fields.js
```

This script ensures:
- `about.hero_image_file` is configured as a file-image field
- `team.avatar_file` is configured as a file-image field

## Media Proxy Route

### Why `/api/media/:id` Exists

Directus assets require server-side authentication (Authorization header with token). Browsers cannot include this header when loading images directly, resulting in 403 Forbidden errors.

The Next.js media proxy route (`/api/media/:id`) solves this by:
1. **Server-side fetch**: The proxy route fetches the asset from Directus using the server-only token
2. **Stream to client**: The binary asset is streamed to the browser without exposing the token
3. **Automatic mapping**: All Directus file UUIDs are automatically mapped to `/api/media/:id` URLs

### How It Works

- **File ID → Proxy URL**: When a Directus file UUID is detected, it's mapped to `/api/media/{uuid}`
- **Server-side auth**: The proxy route uses `DIRECTUS_TOKEN` from server-only environment variables
- **Transparent to client**: The browser only sees `/api/media/:id`, never the Directus URL or token

### Supported Fields

The following fields automatically use the proxy:
- `about.hero_image_file` → `/api/media/{uuid}`
- `team.avatar_file` → `/api/media/{uuid}`
- `partners.logo_file` → `/api/media/{uuid}`
- `events.cover` → `/api/media/{uuid}` (if UUID)
- `news.cover` → `/api/media/{uuid}` (if UUID)

### Verification

Test the proxy route:

```bash
# Get a file ID from Directus
curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  "http://localhost:8055/items/about?limit=1&fields=hero_image_file" | jq '.data.hero_image_file'

# Test proxy route (should return image binary)
curl -s "http://localhost:3000/api/media/{file-id}" -o /tmp/test-image.jpg
file /tmp/test-image.jpg  # Should show image type
```

### Debug Endpoint

The `/api/debug/cms` endpoint also uses the media proxy route for file URLs:
- `directusTeamSample[].avatarUrl` → `/api/media/{uuid}`
- `directusAboutSample.hero_image_url` → `/api/media/{uuid}`

Test it:
```bash
curl -s http://localhost:3000/api/debug/cms | jq '.directusTeamSample[0].avatarUrl'
curl -s http://localhost:3000/api/debug/cms | jq '.directusAboutSample.hero_image_url'
```

## Resources CMS

### Overview

Resources are documents and links that can be linked to projects or categorized as "public". Resources are only visible within project detail pages, not on a separate public page.

### Database Migration

Apply the resources migration:

```bash
psql "postgresql://dimitarmitrev@localhost:5432/ivt_dev" -v ON_ERROR_STOP=1 -f db/migrations/2026-02-04_cms_resources.sql
```

This creates:
- `resources` table (documents/links with file_id or external_url)
- `resource_categories` table (project/public/other)
- `resources_categories` junction table (M2M)
- `resources_projects` junction table (M2M)

### Restart Directus

After applying the migration, restart Directus to introspect the new tables:

```bash
docker-compose -f docker/docker-compose.directus.yml restart
```

### Seed Resources

Seed resources from mock data:

```bash
npm run directus:seed
```

This will seed:
- Resource categories (project/public/other)
- Resources (with project links and categories)
- Junction table entries

### Verify in Directus UI

1. Open Directus Admin: `http://localhost:8055`
2. Navigate to Content → Resources
3. Verify resources are visible with all fields
4. Check `resources_categories` and `resources_projects` junction tables

### Verify on Website

1. Visit a project detail page: `http://localhost:3000/projects/{slug}`
2. Scroll to "Resources" section
3. Resources should display with title, description, and Download/Visit link
4. Gated resources show a "Gated" badge
5. Visit projects listing: `http://localhost:3000/projects`
6. Project cards should show "Resources: N" indicator (if N > 0)

### Resource Features

- **Project-linked resources**: Resources linked to specific projects via `resources_projects` junction
- **Public resources**: Resources with category 'public' and no project links (shown on all project pages)
- **File downloads**: Resources with `file_id` use `/api/media/{uuid}` proxy route
- **External links**: Resources with `external_url` open in new tab
- **Gated indicator**: Resources with `gated=true` show a "Gated" badge (no gating UX yet)
- **Visibility**: Only `visible=true` resources are shown

### Verification Commands

```bash
# Check resources in Directus
curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  "http://localhost:8055/items/resources?limit=3&fields=key,title_en,type,downloadUrl" | jq

# Check resources for a project
curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
  "http://localhost:8055/items/resources?filter[resources_projects][project_id][_eq]={project-id}&fields=key,title_en" | jq

# Check debug endpoint
curl -s http://localhost:3000/api/debug/cms | jq '.directusResourcesSample'
curl -s http://localhost:3000/api/debug/cms | jq '.directusResourcesCountSample'
```

## Related Documentation

- `docs/03-cms-directus/02-seed-content.md` - Seeding Directus with content
- `docs/03-cms-directus/02-schema.md` - Database schema
- `directus/README.md` - Directus setup and management
