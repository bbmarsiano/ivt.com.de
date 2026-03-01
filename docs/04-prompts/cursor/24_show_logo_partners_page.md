Goal: Show uploaded Partner logos from Directus on /partners.

Context:
- Directus collection: partners
- We added a Directus Image field: partners.logo_file (uuid FK to directus_files). The correct image URL is: `${DIRECTUS_URL}/assets/${logo_file}`.
- Our app uses services/directusContentService.ts to map Directus items -> app types and services/contentService.ts for fallback to mocks.
- Currently partners render a placeholder logo (e.g. /placeholder-logo.svg). We need to prefer the uploaded Directus image.

Tasks:
1) Update lib/types/content.ts Partner type to support the new field (if needed):
   - Keep `logo?: string` for the final resolved URL used by the UI.
   - Optionally add `logo_file?: string` if you think it helps, but UI should consume `logo` as a URL.

2) Update services/directusContentService.ts:
   - In mapDirectusPartner(), support `logo_file`:
     - If item.logo_file is a string UUID, set partner.logo = `${baseUrl}/assets/${item.logo_file}`
     - Else if item.logo is a string:
       - If it’s an absolute URL, keep as-is
       - If it starts with '/', keep as-is (site public asset)
       - Else if it looks like a file UUID, also convert to `${baseUrl}/assets/${item.logo}`
     - Else leave logo undefined
   - Ensure the partners fetch includes logo_file:
     GET /items/partners?sort=-createdAt&limit=-1&fields=id,name,website,logo,logo_file,createdAt

3) Update components/partners/PartnersPageClient.tsx:
   - Render the logo using the mapped `partner.logo` URL.
   - Use next/image if already used elsewhere; otherwise keep <img>.
   - Add a robust fallback:
     - If logo URL is missing or image fails to load, show a simple placeholder block with initials (first letter) or an icon.
     - Do NOT break layout.

4) Add dev-only logging (server-side) to confirm mapping:
   - When source=DIRECTUS and fn=getAllPartnersAsync, log a single sample like:
     [IVT][CMS] partners sample: { name, logo, logo_file_present: boolean }
   - Never log tokens.

5) Verification steps (add to docs/03-cms-directus/03-connect-frontend.md or partners doc section):
   - Upload an image in Directus (Partners → TechCorp → logo_file)
   - Refresh http://localhost:3000/partners
   - The uploaded logo should render (URL should be http://localhost:8055/assets/<uuid>)
   - Confirm terminal log shows logo_file_present: true

Constraints:
- Keep Directus token server-only.
- No caching: Directus fetches should remain cache: 'no-store'.
- Keep current UI/UX style and animations intact.

Acceptance criteria:
- Uploaded partner logos show on /partners after refresh.
- Works with both uploaded logo_file and fallback placeholder logo.
- No runtime errors, typecheck and lint pass.
