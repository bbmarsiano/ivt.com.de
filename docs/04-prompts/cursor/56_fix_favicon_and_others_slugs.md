Update CMS pages denylist to ignore system/static asset slugs.

File: app/[slug]/page.tsx

Tasks:
1) Extend denylist to include:
   - 'favicon.ico'
   - 'robots.txt'
   - 'sitemap.xml'
   - 'manifest.json'
   - 'sw.js'
   - 'browserconfig.xml'
2) Keep existing denylist for real app routes (/projects, /resources, /news, /events, /about, /partners, /contact, etc).
3) Add a comment:
   - We intentionally denylist these because Next/static assets may request them.
   - When a real favicon is added later (app/favicon.ico or public/favicon.ico), Next will handle it.

Deliverables:
- Summary
- Quick manual test: open /favicon.ico and confirm it is NOT hitting Directus page lookup logs.
