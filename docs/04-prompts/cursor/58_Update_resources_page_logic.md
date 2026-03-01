Update /resources page logic to use Directus Categories (Public/Project/Other) + kind, and add YouTube popup for videos.

Constraints:
- Additive changes only. Do not modify existing gated logic or request-access flows.
- /resources page must show ONLY Public category resources (never gated here).
- Keep existing look & feel and current interactive cards behavior.

Data model:
- resources.kind: document | video | download | guide
- resources.categories is M2M via resources_categories -> category_id.key (values: public, project, other)
- resources.gated / visible existing rules.

Required behavior by card:

1) Documents card:
- Show resources where:
  - visible === true
  - gated === false
  - kind === 'document'
  - categories contains 'public'

2) Videos card:
- Show resources where:
  - visible === true
  - gated === false
  - kind === 'video'
  - categories contains 'public'
- Clicking a video item:
  - If external_url is a YouTube URL => open modal popup with embedded player (iframe).
  - If external_url missing or not YouTube => open modal popup with message:
      DE: "Bitte fügen Sie eine YouTube-URL im Feld External URL hinzu."
      EN: "Please add a YouTube URL in the External URL field."
  - Keep this validation only in UI (no backend constraints).

YouTube parsing:
- Support:
  - https://www.youtube.com/watch?v=ID
  - https://youtu.be/ID
  - https://www.youtube.com/embed/ID
  - https://www.youtube.com/shorts/ID
- Convert to embed URL: https://www.youtube.com/embed/ID

3) Downloads card:
A) Public downloads (not linked to a project):
- resources where:
  - visible === true
  - gated === false
  - kind === 'download'
  - categories contains 'public'
  - NOT linked in resources_projects (any project)

B) Project downloads:
- For each project that has Public downloads:
  - show project title localized (title_de/title_en)
  - list resources that are:
    - visible === true
    - gated === false
    - kind === 'download'
    - categories contains 'public'
    - linked to that project via resources_projects

Implementation approach (safe + minimal):
- app/resources/page.tsx (server):
  - Fetch public resources (must include categories.category_id.key and kind and external_url).
  - Fetch projects and for each project fetch project resources (already exists).
  - While building projectDownloadsByProject, ensure filtering uses:
      kind==='download', visible, !gated, AND category key includes 'public'
  - Build a Set of linked resource IDs from all project downloads.
  - Compute unlinkedPublicDownloads = public downloads (category public + kind download + visible + !gated) excluding IDs in the Set.
  - Pass:
      publicResources (already public)
      unlinkedPublicDownloads
      projectDownloadsByProject
    to ResourcesPageClient.

- components/resources/ResourcesPageClient.tsx:
  - For Documents/Videos/Guides filter publicResources by category public + kind, and !gated + visible.
  - Downloads section:
     - show unlinkedPublicDownloads list
     - show projectDownloadsByProject grouped list
  - Add VideoModal component (client) with open/close state and iframe embed.

- services/directusContentService.ts:
  - Ensure getPublicResources includes fields:
      categories.category_id.key, external_url, kind
  - Ensure getResourcesByProjectId includes:
      resource_id.categories.category_id.key and resource_id.external_url and resource_id.kind

UX polish:
- Keep the 4 cards behavior + “View all resources” (localized DE/EN).
- Lists should look modern, clean spacing.
- Empty states localized.

Deliverables:
- Summary of changed files
- Manual tests checklist
