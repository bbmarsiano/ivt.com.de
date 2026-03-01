Goal: Fix getPublicResourcesAsync to fetch public resources based on M2M categories alias categories (resources ↔ resources_categories ↔ resource_categories). A resource is “public” if it has at least one category with key public (even if it also has project). Also ensure downloadUrl uses /api/media/{file_id} when file_id is set; otherwise fallback to external_url. Update /api/debug/cms to reflect the corrected output.

Context:
We have Directus collections:

resources (fields: key, title_en, ..., file_id (uuid FK directus_files), external_url, visible, gated, etc.)

resource_categories (key: project/public/other)

junction resources_categories (resource_id, category_id)
We already created Directus relations:

directus_relations for resources_categories.resource_id → resources.categories (junction_field=category_id)
So the alias field on resources is named categories, and returns items like { category_id: { key, title_en } }.

Bug: getPublicResourcesAsync currently returns only public-funding-guide, but ai-research-whitepaper should also appear after we linked it to category public.

Required changes

In services/directusContentService.ts

Ensure mapDirectusResource() (or equivalent mapper) can map categories:

Input: categories?: Array<{ category_id?: { key?: string } }>

Output: categories: string[] (array of category keys, e.g. ["public","project"])

Update / create getPublicResourcesAsync() (or getPublicResources() depending on current naming) to query Directus like:

endpoint: /items/resources

filters:

filter[visible][_eq]=true

filter[categories][category_id][key][_eq]=public

fields include:

key,title_en,file_id,external_url,visible,gated

categories.category_id.key

sort: newest first (sort=-published_at or sort=-createdAt—use the one that exists in schema)

limit: -1

For each returned item, compute:

downloadUrl = file_id ? "/api/media/" + file_id : external_url

Keep file_id and external_url in output.

In services/contentService.ts

Ensure the exported getPublicResourcesAsync() uses Directus-first and mocks fallback, consistent with other entities.

Ensure fallback behavior stays unchanged when Directus is down.

In app/api/debug/cms/route.ts (or wherever debug endpoint is)

Ensure directusPublicResourcesSample prints the output of the public resources fetch.

Output items should include: key,title_en,file_id,external_url,downloadUrl,categories.

Acceptance checks (must pass)

After code changes:

curl -s http://localhost:3000/api/debug/cms | jq '.directusPublicResourcesSample'
should include both:

public-funding-guide (still external_url download)

ai-research-whitepaper (has file_id=157cb720-... and downloadUrl="/api/media/157cb720-...")

categories for ai-research-whitepaper should include "public" and "project".

Do not change schema/migrations. Only fix fetching + mapping + debug output.