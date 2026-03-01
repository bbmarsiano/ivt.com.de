You are working in a Next.js 13 app router project. We use Directus on http://localhost:8055 with server-only token in .env.local. Directus assets require Authorization header, so browser <img> to /assets/:id returns 403. We need a secure Next.js proxy route.

Implement a media proxy route and update CMS mappings to use it.

Requirements:
1) Create a new API route:
   - File: app/api/media/[id]/route.ts
   - GET /api/media/:id should:
     - Read Directus URL and token from server-only env helpers (lib/env.directus.ts)
     - Fetch `${DIRECTUS_URL}/assets/${id}` with header `Authorization: Bearer ${token}`
     - Use `cache: 'no-store'`
     - If Directus responds non-OK, forward status (404/403/etc) with a small text response
     - On success, stream/return the binary body
     - Set response headers:
       - Content-Type: pass-through from Directus (fallback application/octet-stream)
       - Cache-Control: no-store (DEV)
   - Export:
     - export const dynamic = 'force-dynamic'
     - export const revalidate = 0

2) Update Directus content mapping so file ids return proxy URLs:
   - In services/directusContentService.ts, wherever we map file IDs to asset URLs (e.g. hero_image_file, avatar_file, partners logo_file, events cover), change to:
     - If value is a UUID (file id), return `/api/media/${id}` instead of `${baseUrl}/assets/${id}`
     - If it's already a full URL or starts with '/', keep as-is (do not double-proxy)
   - Specifically ensure:
     - Team: avatarUrl uses proxy when avatar_file is set
     - About: hero_image_url uses proxy when hero_image_file is set
     - Partners: logo URL uses proxy when logo_file is set (if present)
     - Events: cover mapping should proxy if it’s a UUID

3) Keep tokens server-only:
   - The proxy route must never expose token in output
   - Client should only see /api/media/:id

4) Add a small note in docs:
   - docs/03-cms-directus/03-connect-frontend.md
   - Explain why /api/media exists (Directus assets require auth in browser)

After changes:
- npm run typecheck should pass
- npm run lint should pass

Provide the exact code changes.
