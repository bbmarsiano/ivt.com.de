You are working in a Next.js 13.5 (app router) repo with Directus integration. We have resources and projects already seeded into Directus, and we have junction tables:
- resources_projects (links resources <-> projects)
- resources_categories (links resources <-> resource_categories)

Problem:
1) /projects shows correct “Resources: N” counts sometimes, but /projects/[slug] still shows mock resources instead of reading the real junction relations.
2) directus:seed currently seeds resources + resource_categories, but DOES NOT create junction rows in resources_projects/resources_categories.

Goal:
- Make the UI use real Directus relations for project detail resources.
- Update the seed script so it seeds junction rows too.
- Keep the “Directus-first with mocks fallback” pattern, BUT: if Directus is enabled and the request succeeds (even if empty), do NOT silently show mock resources on project detail. Only fallback to mocks on error or when Directus is disabled.
- Add clear logs with [IVT][CMS] prefix.

Implement the following changes:

A) Fix Directus fetching for project resources (server-side)
1) In services/directusContentService.ts add (or update) a method:

   async getResourcesByProjectId(projectId: string): Promise<Resource[]>

   It must call Directus endpoint:
   GET /items/resources_projects
   with filter[project_id][_eq]=<projectId>
   and fields=resource_id.*   (so it returns the linked Resource in-line)

   Example query string:
   /items/resources_projects?filter[project_id][_eq]=...&fields=resource_id.*

   Map the response into Resource[] by taking each row.resource_id object.

   IMPORTANT:
   - Use cache: 'no-store'
   - Convert file_id into a downloadable url via our existing media proxy rule:
     return fileUrl as `/api/media/${file_id}` (NOT direct /assets).
   - If external_url is present and file_id is null, keep external_url.
   - Ensure only visible === true resources are returned (either filter client-side or via Directus filter if schema supports it).
   - Log: [IVT][CMS] source=DIRECTUS ... fn=getResourcesByProjectId count=N

2) In services/contentService.ts:
   - Ensure getProjectResourcesAsync(projectSlug: string) uses:
     - getProjectBySlugAsync first to get project.id
     - then calls directusContentService.getResourcesByProjectId(project.id)
   - If Directus enabled and both calls succeed, return the directus result even if it’s empty.
   - Only fallback to mock resources if:
     - Directus disabled OR
     - a request throws (403/500/etc)
   - Log errors as:
     [IVT][CMS] DIRECTUS_FETCH_FAILED fn=getProjectResourcesAsync error=...

B) Make the project detail page actually render the fetched resources
1) Locate the project detail server component (app/projects/[slug]/page.tsx) and ensure it fetches resources server-side:
   const resources = await contentService.getProjectResourcesAsync(slug)

2) Ensure the client component (ProjectDetailClient or equivalent) receives a `resources` prop and uses it for rendering (instead of importing mock resources internally).
   - Remove any direct import/use of mock resources in the project detail UI.
   - If resources is empty, show “No resources yet” (or keep existing UI but without mock items).

C) Fix counts on /projects (if needed)
If counts still come from mocks or are always 0:
1) Implement in directusContentService.ts:

   async getResourcesCountsByProject(): Promise<Record<string, number>>
   - Use Directus:
     GET /items/resources_projects?aggregate[count]=*&groupBy[]=project_id
   - Then map into { [project_id]: count }

2) In contentService.ts:
   - getResourcesCountsByProjectAsync returns those counts when Directus enabled.
   - Merge counts into the projects list by matching project.id.
   - Only fallback to mock counts on error or if Directus disabled.

D) Update seed script to create junction rows
In scripts/directus-seed-from-mocks.ts:
1) Ensure we have mock data for resources including:
   - projectSlugs?: string[] (optional)
   - categoryKeys?: string[] (optional)
   If not present, add a minimal mapping:
   - Link "innovation-network-link" to project slug "renewable-energy-grid" (as a demo)
   - Add categories for each resource (at least one categoryKey among: project/public/other)
   Keep it small and deterministic.

2) After seeding resources and categories, add two new seed steps:
   - seedResourcesProjectsLinks()
   - seedResourcesCategoriesLinks()

Implementation details:
- Fetch all projects once:
  GET /items/projects?limit=-1&fields=id,slug
- Fetch all resource_categories once:
  GET /items/resource_categories?limit=-1&fields=id,key
- Fetch all resources once:
  GET /items/resources?limit=-1&fields=id,key

Then for each mock resource:
- If it has projectSlugs:
  resolve project.id by slug
  POST/UPSERT into /items/resources_projects a row:
    { resource_id: <resourceId>, project_id: <projectId> }
  Use an upsert strategy:
   - Try POST; if it fails with duplicate, ignore.
   - Or query existing first and only create if missing.

- If it has categoryKeys:
  resolve category.id by key
  POST/UPSERT into /items/resources_categories a row:
    { resource_id: <resourceId>, category_id: <categoryId> }

3) Print summary counts created/updated for both link tables.

E) Developer verification additions
- Extend app/api/debug/cms/route.ts to include:
  - directusResourcesProjectsSample: first 5 rows with fields=resource_id.key,project_id
  - directusProjectResourcesSample: for one known project slug (renewable-energy-grid), return resolved resources via getProjectResourcesAsync

All changes must keep token server-only and use cache:'no-store'. Run TypeScript + lint fixes if needed.

Acceptance criteria:
- After linking at least one resource to a project, /projects/[slug] shows that resource (not mocks).
- Seed creates junction rows so links exist automatically after npm run directus:seed.
- /api/debug/cms shows junction samples and project resources sample.
- Logs show [IVT][CMS] source=DIRECTUS ... fn=getProjectResourcesAsync count=...
