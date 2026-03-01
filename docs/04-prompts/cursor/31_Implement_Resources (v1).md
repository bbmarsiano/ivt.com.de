You are working in a Next.js 13 App Router project with Directus + Postgres.

Goal:
Implement CMS "Resources" (documents/links) with:
- One resources collection
- Category taxonomy (many-to-many)
- Optional link to one or many projects (many-to-many) for shared docs
- Public resources not linked to any project but categorized as "public"
- Seed initial resources from mock data
- Show resources in project detail as a simple list (title + description + download/link)
- Show a small indicator/count in the projects listing (e.g. “Resources: N”)
- All reads must be Directus-first with mocks fallback, server-side only, no caching (no-store) and logs [IVT][CMS].

Data model requirements:
1) Create SQL migration:
   db/migrations/2026-02-04_cms_resources.sql

Tables:
A) resources
- id UUID PK default gen_random_uuid()
- key VARCHAR(255) UNIQUE NOT NULL (stable id for seed/upsert)
- title_de VARCHAR(255) NOT NULL
- title_en VARCHAR(255) NOT NULL
- description_de TEXT NULL
- description_en TEXT NULL
- type VARCHAR(50) NOT NULL (e.g. 'PDF','DOC','PPT','LINK','OTHER')
- file_id UUID NULL (FK -> directus_files.id, ON DELETE SET NULL)
- external_url VARCHAR(1000) NULL
- gated BOOLEAN NOT NULL DEFAULT false
- visible BOOLEAN NOT NULL DEFAULT true
- published_at TIMESTAMPTZ NULL
- createdAt TIMESTAMPTZ NOT NULL DEFAULT now()
- updatedAt TIMESTAMPTZ NOT NULL DEFAULT now()
Indexes: createdAt, visible, type, published_at, key unique

B) resource_categories
- id UUID PK default gen_random_uuid()
- key VARCHAR(100) UNIQUE NOT NULL (e.g. 'project','public','other')
- title_de VARCHAR(255) NOT NULL
- title_en VARCHAR(255) NOT NULL
- sort INT NOT NULL DEFAULT 0

C) resources_categories (M2M)
- resource_id UUID FK -> resources.id ON DELETE CASCADE
- category_id UUID FK -> resource_categories.id ON DELETE CASCADE
- PK(resource_id, category_id)

D) resources_projects (M2M)
- resource_id UUID FK -> resources.id ON DELETE CASCADE
- project_id UUID FK -> projects.id ON DELETE CASCADE
- PK(resource_id, project_id)

Also ensure FK constraints exist (idempotent).

Directus integration:
- Add types in lib/types/content.ts:
  Resource, ResourceCategory, plus add resourcesCount?: number to Project if needed.
- Update services/directusContentService.ts:
  - mapDirectusResource(): map file_id to media proxy URL `/api/media/<uuid>` (server-side string only)
    - If external_url present, expose externalUrl
    - Provide downloadUrl: if file_id -> `/api/media/<uuid>` else external_url
  - getResourcesByProjectSlug(slug): fetch resources linked to that project via resources_projects
  - getPublicResources(): fetch resources with category 'public' and no project links
  - getResourcesCountsByProject(): fetch resources_projects and compute counts per project in code (no heavy aggregates)
- Update services/contentService.ts:
  - Add getProjectResourcesAsync(slug) -> Directus-first, fallback to mocks
  - Add getPublicResourcesAsync() -> Directus-first, fallback to mocks
  - Update getProjectsAsync() so each project includes resourcesCount (if available), or provide separate map used in listing page.

Frontend:
- Project detail page:
  - Show “Resources” section below main content:
    - List items: title (localized), description (localized), and a Download/Visit link
    - Only show visible resources
    - Combine: project-linked resources + public resources (category 'public')
    - If gated=true, show a small “Gated” label (no gating UX yet)
- Projects listing page:
  - Show a small “Resources: N” indicator per project card (N from resourcesCount)
  - If N=0, show nothing

Mock data + seed:
- Extend lib/data/mock-data to include:
  - mockResourceCategories (project/public/other with DE/EN titles)
  - mockResources with a mix of:
    - linked-to-project docs (some shared across 2 projects)
    - public docs (no project links, category public)
    - other docs category other
  - Each resource has key, title_de/en, description_de/en, type, either external_url or file_id placeholder (use external_url in mocks initially)
- Update scripts/directus-seed-from-mocks.ts:
  - Seed resource_categories (upsert by key)
  - Seed resources (upsert by key)
  - Seed resources_categories junction
  - Seed resources_projects junction using project slug -> project id lookup
  - Print summary counts

Permissions:
- Update scripts/directus-fix-permissions.js to include 'resources' and 'resource_categories' and junctions if needed.
  (If your setup doesn’t require it, keep it harmless.)

Debug:
- Update app/api/debug/cms/route.ts to include:
  - directusResourcesSample (top 3 resources with key/title_en/type/downloadUrl)
  - for one project: resourcesCount sample

Docs:
- Update docs/03-cms-directus/03-connect-frontend.md with:
  - New Resources section
  - Verification commands

Important:
- Do NOT introduce a /resources public page. Resources are only visible inside projects.
- Keep everything server-side fetch (tokens never on client).
- Use no-store for Directus fetches.
- Log with [IVT][CMS] ... fn=...

After implementing, provide the exact terminal commands to:
1) apply migration
2) restart directus
3) seed
4) verify via curl
5) verify in browser
