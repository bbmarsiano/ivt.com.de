We need to clean up /api/debug/cms so that resources are not duplicated
and project/public resources are clearly separated.

GOAL:

1. directusPublicResourcesSample
   → only public resources
   → no duplicates
   → dedupe by key

2. directusResourcesByProjectSample
   → only resources for a specific project (if slug provided)
   → no duplicates
   → dedupe by key

3. NEVER merge public + project arrays.
4. If duplicates exist, prefer the object that has categories defined.

IMPLEMENTATION:

STEP 1 — Find the debug endpoint
Search for:
- /api/debug/cms
- directusPublicResourcesSample
- directusResourcesByProjectSample

STEP 2 — Add helper utility:

function dedupeResourcesByKey(resources: any[]) {
  const map = new Map<string, any>();

  for (const r of resources) {
    const existing = map.get(r.key);

    if (!existing) {
      map.set(r.key, r);
      continue;
    }

    // Prefer resource that has categories
    const existingHasCategories = Array.isArray(existing.categories) && existing.categories.length > 0;
    const newHasCategories = Array.isArray(r.categories) && r.categories.length > 0;

    if (!existingHasCategories && newHasCategories) {
      map.set(r.key, r);
    }
  }

  return Array.from(map.values());
}

STEP 3 — Apply dedupe separately:

directusPublicResourcesSample =
  dedupeResourcesByKey(publicResources);

directusResourcesByProjectSample =
  dedupeResourcesByKey(projectResources);

STEP 4 — Ensure debug JSON returns:

{
  env: {...},
  directusPublicResourcesSample,
  directusResourcesByProjectSample,
  directusResourcesCountsSample
}

STEP 5 — DO NOT merge arrays together.

STEP 6 — Restart dev server after change.

After implementation, I will verify with:

curl -s http://localhost:3000/api/debug/cms | jq '.directusResourcesByProjectSample'
