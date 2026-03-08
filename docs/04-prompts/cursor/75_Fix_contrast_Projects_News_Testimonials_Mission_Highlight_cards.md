Scope: Styling only. Do NOT change functionality, routing, data fetching, or component behavior. Do NOT change copy text. No refactors.

Goal:
Apply the same readability/contrast improvements used for "Upcoming Events" to:
- Projects section heading/subheading (Featured Projects / Projects area)
- Latest News section heading/subheading
- Testimonials section heading/subheading + quote text readability
- Mission paragraph text:
  "Innovation Valley Thüringen serves as a dynamic integration environment for Thuringia-based and German companies. We focus on executing ongoing projects in technology and product development, ensuring 100% German-made quality from concept to production."
- Highlight cards: Collaborative Projects / Thuringia Hub / Made in Germany (titles + descriptions)

Constraints:
- Keep all components, data, and logic unchanged.
- Only adjust Tailwind classes / CSS for text color, opacity, font weight, and panel overlays.
- Do NOT introduce new colors #f9aa8f or #ed1c24.

Implementation steps:

1) Locate the Home page sections or their components:
   Search for strings:
   - "Projects", "Featured Projects", "Latest News", "Testimonials"
   - The exact Mission paragraph above
   - "Collaborative Projects", "Thuringia Hub", "Made in Germany"

2) For each section header (title + subtitle):
   - Title class: set to high contrast
     Example target: text-white (or text-white/90) + font-bold
   - Subtitle class: medium contrast
     Example target: text-white/60 or text-white/70
   Ensure none of these use dark text colors (text-black, text-gray-900, etc).

3) Mission paragraph (the long text):
   - Ensure readable on dark background:
     text-white/70 (or /75)
     leading-relaxed
   If the mission is inside a panel, ensure the panel background is present:
     bg-black/25 (or bg-white/5) + border-white/10
   Keep the red vertical accent line (if exists) but do not change its logic.

4) Highlight cards (3 cards):
   - Card title: text-white/90 + font-semibold
   - Card description: text-white/60
   - Ensure cards have enough separation from background:
     bg-black/20 (or bg-white/5) + border-white/10
   - Do NOT change icons or card layout.

5) Testimonials:
   - Section title/subtitle same as above.
   - Quote text: text-white/80 (or /75) for readability.
   - Attribution: text-white/55
   - Keep rotation/slider logic unchanged.

6) Projects and News:
   - Section titles/subtitles readable as above.
   - If there are section-intro paragraphs, set to text-white/60–70.
   - Do NOT change any carousel/grid components or cards functionality.

7) Verify no regressions:
   - Buttons remain as before.
   - Register/apply actions unchanged.
   - Only visual contrast improved.

Output:
- List modified files.
- Minimal diff.
- Confirm only styling changes, no functional changes.