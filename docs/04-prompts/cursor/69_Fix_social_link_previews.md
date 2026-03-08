TASK: Fix social link previews (Open Graph / Twitter) to use IVT logo instead of bolt.new default.

CONSTRAINTS:
- Do not change existing functionality or routing.
- Only add metadata + add required public assets if missing.
- Use existing logo asset in /public/brand/ivt/ (confirmed).
- Site URL in production is: https://ivt-com-de-lqj8u.ondigitalocean.app
- Ensure metadata works both locally and in production.

STEPS:
1) Update app/layout.tsx:
   - Export const metadata: Metadata with:
     - metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
     - title: { default: "Innovation Valley Thüringen", template: "%s | Innovation Valley Thüringen" }
     - description: short description (EN default) e.g. "Innovation hub connecting projects, partners and resources in Thuringia."
     - openGraph: { type: "website", siteName, title, description, images: [{ url: "/brand/ivt/IVT_logo_Horizontal@3x.png", width: 883, height: 372, alt: "Innovation Valley Thüringen" }] }
     - twitter: { card: "summary_large_image", title, description, images: ["/brand/ivt/IVT_logo_Horizontal@3x.png"] }
     - icons: { icon: "/brand/ivt/IVT_Icon@3x.png" }
   - Keep existing layout code unchanged.

2) Ensure a stable OG image endpoint:
   - Add a new file in /public/og.png by copying from /public/brand/ivt/IVT_logo_Horizontal@3x.png if /public/og.png does not exist.
   - Then set openGraph images to "/og.png" and twitter images to "/og.png" for stability (simple canonical asset).

3) Add a quick verification note in comments (not docs) with:
   - curl to fetch / and grep og:image
   - local URL example.

DELIVERABLE:
- Updated app/layout.tsx
- Added public/og.png (copy) if needed
- No other changes.