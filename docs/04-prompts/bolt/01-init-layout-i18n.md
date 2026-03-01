You are building a production-quality marketing website + CMS-ready frontend for:
Name: Innovation Valley Thüringen
Default language: German (DE)
Secondary language: English (EN)

Tech:
- Next.js 14+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Clean, premium “German engineering” design (minimal, innovative, high-end)
- No backend yet (no database, no Directus integration yet)

Must implement:
1) Global layout:
   - Sticky header with:
     - Logo placeholder (text-based for now: "IVT")
     - Main navigation (DE labels default, EN labels when switched)
     - Language switcher (DE / EN)
     - Small button "Intro" to replay intro video later (disabled for now; will be wired in Prompt #2)
   - Footer with:
     - Navigation links
     - Legal links: Imprint, Privacy Policy
     - Copyright

2) Routing (create pages with strong UI skeletons and placeholder sections):
   - / (Homepage)
   - /about
   - /projects
   - /projects/[slug]
   - /partners
   - /news
   - /events
   - /resources
   - /why-thuringia
   - /why-now
   - /impact
   - /goals
   - /contact
   - /imprint
   - /privacy

3) Internationalization:
   - DE default, EN toggle
   - Use a simple approach suitable for App Router (no heavy libs required).
   - Provide a lightweight translation dictionary in code.
   - Ensure all navigation labels and page headings switch language.

4) Design system basics:
   - Define consistent spacing, typography scale, button styles, card styles.
   - Use shadcn/ui components where helpful.

Data:
- Use temporary mock content in code (objects), clearly marked as "mock" to be replaced later by CMS.

Output:
- Provide clean folder structure: app/, components/, lib/ (or similar)
- Code should run without missing imports and without backend dependencies.
