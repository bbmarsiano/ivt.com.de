We already have Directus resources working with downloadUrl mapping:
- file_id -> /api/media/:id
- external_url -> external_url

Now implement gated behavior.

Requirements:
1) In UI where resources are rendered (project resources section and public resources list),
   if resource.gated === true:
   - do NOT render the direct download link
   - render a "Request access" CTA button instead
   - show a small helper text (EN/DE optional: use existing locale mechanism if present; otherwise EN only)

2) CTA destination:
   - Prefer linking to /contact if exists, else fallback to mailto.
   - Create a single helper function:
       getGatedCtaUrl(resource, project?) => string
     that returns:
       - `/contact?resource=<key>` if route exists OR
       - `mailto:${DEFAULT_CONTACT_EMAIL}?subject=Access request: <title>&body=...`
   - Put DEFAULT_CONTACT_EMAIL in env (NEXT_PUBLIC_CONTACT_EMAIL) with fallback "info@ivt.de".

3) Keep non-gated resources unchanged: button "Download" (for file) or "Open" (for link).
   - For LINK type, label should be "Open".
   - For file, label should be "Download".

4) Add a small debug field in /api/debug/cms response for one public resource:
   - include gated boolean in public resources sample output so we can confirm.

5) Add tests or at least typecheck/lint passes.

After changes, provide verification commands:
- curl /api/debug/cms | jq '.directusPublicResourcesSample'
- open /projects/<slug> and verify gated item shows Request access and does not download.
