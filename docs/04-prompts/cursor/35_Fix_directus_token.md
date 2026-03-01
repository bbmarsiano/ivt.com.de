We have a Next.js 13 app with Directus integration.

Problem:
- contentService.getPublicResourcesAsync logs: "Directus authentication failed (403)" and debug endpoint returns directusPublicResourcesSample = []
- Directus API calls from terminal with Authorization token work fine.

Goal:
Hard-fix Directus requests so ALL requests in directusContentService ALWAYS include Authorization header (Bearer token) when DIRECTUS_TOKEN is present. Ensure getPublicResourcesAsync returns real data and debug endpoint shows 3 items.

Tasks:
1) In lib/env.directus.ts ensure getDirectusToken() returns the token from process.env.DIRECTUS_TOKEN (server-only).
2) In services/directusContentService.ts create a single private helper:
   - private async fetchDirectus<T>(path: string): Promise<T>
   - It must build url = `${baseUrl}${path}`
   - It must set headers: { Authorization: `Bearer ${token}` } if token exists
   - It must set cache: 'no-store'
   - It must throw a clear error including HTTP status and response body snippet when non-2xx
3) Refactor ALL Directus calls in directusContentService to use fetchDirectus(), including:
   - getPublicResources()
   - getProjectResourcesByProjectId()
   - getResourcesCountsByProject()
   - any resources_categories/resources_projects calls
4) In services/contentService.ts, in getPublicResourcesAsync, log once per request:
   - [IVT][CMS] source=DIRECTUS ... fn=getPublicResourcesAsync count=<n>
   - If failed, log [IVT][CMS] DIRECTUS_FETCH_FAILED fn=getPublicResourcesAsync status=<status>
   - Do NOT fallback to mocks silently; fallback is OK but MUST log reason.
5) Update /api/debug/cms to return directusPublicResourcesSample:
   - fetch public resources via contentService.getPublicResourcesAsync()
   - include key,title_en,file_id,external_url,downloadUrl
6) Ensure typecheck & lint pass.

Deliver summary of modified files.
