Goal:
Prove definitively whether the Next.js app is using Directus or mock data when USE_DIRECTUS=1, without guessing. Add server-side verification, logging, and a debug endpoint.

1. Create a server-only Directus environment helper

Create file:

lib/env.directus.ts


Implement:

isDirectusEnabled(): boolean

Returns true if process.env.USE_DIRECTUS === "1" or "true"

getDirectusUrl(): string | null

getDirectusToken(): string | null

getCmsEnvDebug(): object

Returns:

{
  USE_DIRECTUS: process.env.USE_DIRECTUS,
  DIRECTUS_URL: process.env.DIRECTUS_URL,
  DIRECTUS_TOKEN_LEN: process.env.DIRECTUS_TOKEN?.length ?? 0,
  NODE_ENV: process.env.NODE_ENV
}


⚠️ Must never be imported in client components.

2. Add a debug API endpoint (hard proof)

Create:

app/api/debug/cms/route.ts


GET /api/debug/cms must:

Return environment info from getCmsEnvDebug()

Fetch GET {DIRECTUS_URL}/server/info (if URL exists)

Fetch real data from Directus:

GET /items/projects?limit=3&fields=slug,title_en
Authorization: Bearer <DIRECTUS_TOKEN>


Disable caching (cache: "no-store")

Response shape:

{
  "env": { ... },
  "directusServerInfo": { ... } | null,
  "directusProjectsSample": [...] | null,
  "errors": [] | null
}


Never return the token value.

3. Centralize CMS source decision + logging

In the service that loads content (projects, news, etc.):

Add shouldUseDirectus() that checks:

isDirectusEnabled()

Directus URL exists

Directus token exists

Add server logs:

When Directus is used:

[IVT][CMS] Using DIRECTUS url=http://localhost:8055 tokenLen=45


When mocks are used:

[IVT][CMS] Using MOCKS (reason: ...)


Valid reasons:

USE_DIRECTUS disabled

Missing env vars

Directus request failed

4. Disable caching for Directus in development

All Directus fetch calls must include one of:

cache: "no-store"


or

next: { revalidate: 0 }

5. Visible CMS source badge (DEV only)

Add a small badge visible only in development:

CMS: DIRECTUS


or

CMS: MOCKS


Rules:

Decision must be server-side

Do not read env directly in client

Pass a boolean prop or render in server component

6. Acceptance criteria

After implementation:

GET /api/debug/cms shows:

USE_DIRECTUS = "1"

DIRECTUS_TOKEN_LEN > 0

directusProjectsSample contains live Directus data

Changing a project title in Directus updates the site after refresh

Stopping Directus switches app to mocks (no crash, logs explain fallback)

7. Do NOT

Do not expose secrets

Do not rely on client-side env

Do not remove mock fallback

Do not guess CMS source