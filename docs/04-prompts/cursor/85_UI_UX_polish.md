Scope: UI/UX styling and existing i18n wiring only. Do NOT break routing, API calls, data fetching, or page functionality. No refactors. No new dependencies unless absolutely necessary. Keep all existing logic intact.

Goal:
Apply the following visual/content fixes across the site.

------------------------------------------------
1) INTRO VIDEO — make it much larger and properly 16:9

Locate the intro video modal/popup/container.

Current issue:
The video appears too small. The source video is 1920x1080 (16:9), so the container/fitting is the problem.

Fix:
- Make the video appear close to full-screen while preserving 16:9 ratio.
- Use a 16:9 container and make it responsive to viewport size.
- Prefer:
  - aspect-[16/9]
  - object-cover
- The video should occupy most of the screen, centered.

Suggested container behavior:
- width: min(92vw, 92vh * 16 / 9)
- max-height: 92vh
- aspect-ratio: 16 / 9

Suggested classes:
- container: "relative w-[min(92vw,calc(92vh*16/9))] max-h-[92vh] aspect-[16/9]"
- video: "w-full h-full object-cover rounded-xl"

Do NOT change intro logic or replay logic.

------------------------------------------------
2) HERO SECTION — add German translation + button hover fixes

Locate the hero copy on the home page.

Make these two texts language-aware so they switch between EN and DE using the existing language system:
EN:
- "Welcome to Innovation Valley Thüringen"
- "Where German Companies Unite for Cutting-Edge Development, Implementation, and Production."

DE:
- "Willkommen im Innovation Valley Thüringen"
- "Wo deutsche Unternehmen für zukunftsweisende Entwicklung, Umsetzung und Produktion zusammenkommen."

Also ensure these hero buttons follow the required hover behavior:
A) "Explore Our Ecosystem"
- on hover: background becomes white
- text becomes gray (dark gray, readable)
B) "View Strategic Projects"
- on hover: background becomes transparent
- text becomes white

Do NOT change button logic or links.

------------------------------------------------
3) HOME HIGHLIGHT CARDS — style like About page cards

Locate the 3 home cards:
- Collaborative Projects
- Thuringia Hub
- Made in Germany

Update their visual styling so they match the cards on the About page:
- same card surface/background style
- same text color style
- but KEEP the defense/tactical frame
- keep the current hover effect

Do NOT change card copy or icons.

------------------------------------------------
4) TESTIMONIALS — quote text color

Locate the quoted testimonial text inside quotation marks.

Change the quote text color from white to gray/light gray for better contrast hierarchy.
Keep attribution readable.
Do NOT change layout or slider logic.

------------------------------------------------
5) HERO STATS — numbers in white

Locate the animated stats numbers:
- 500+
- 150+
- 50+
- €100M+

Keep the animation, but change the NUMBER color to white.
Do NOT change the labels or animation logic.

------------------------------------------------
6) PROJECTS PAGE — search/order row + project cards

Locate the Projects page search/order/filter section.

A) Search row layout:
- Reduce the width of the "Search projects" field so that the "Sort by" field fits on the same row with the other controls.
- Keep responsive behavior on mobile.

B) Search/order section styling:
- remove white background
- make background transparent or translucent
- add a border/frame similar to the defense border used in the home hero section

C) Project cards:
- On each project card, locate the "Learn more" button
- add a gray border matching the text color
- keep the current hover effect

Do NOT change project filtering/sorting logic.

------------------------------------------------
7) RESOURCES PAGE — text color + button hover + scroll + selected card text

A) Make the page title "Resources" white.
B) "View all resources" button:
- on click, automatically scroll down to the section below the cards where all resources are listed
- keep existing behavior if already present, but ensure smooth scroll to that section
- on hover: background becomes transparent, text becomes white
C) When clicking a resource card (example: Video), the text that appears below is currently gray.
- Make that revealed/selected content text white.

Do NOT change resource data logic.

------------------------------------------------
8) CONTACT PAGE — title colors

Make these texts white:
- "Contact"
- "Contact Information"

Do NOT change content structure.

------------------------------------------------
9) WHY THURINGIA PAGE

A) Make the title "Why Thuringia" white.
B) Use a nature image of Thuringia for the visual/hero image on that page.
- If there is already an image slot/component, replace the current image with a Thuringia nature image from existing project/public assets if available.
- Do NOT fetch new remote images.
- If no suitable local image exists, keep the current image unchanged and only adjust title color.

------------------------------------------------
10) WHY NOW PAGE

Make the title "Why Now" white.

------------------------------------------------
11) IMPACT PAGE

A) Make the title "Impact" white.
B) Move this text:

"Our Impact
Innovation Valley Thuringia has had a significant impact on the regional innovation landscape since its inception. By supporting startups, promoting research projects, and facilitating investments, we contribute to the economic development of the region."

into the same card/panel style used on the home page for the mission text:
"Innovation Valley Thüringen serves as a dynamic integration environment for Thuringia-based and German companies..."

Use the same visual card style only.
Do NOT change the text content.

------------------------------------------------
12) GOALS PAGE

Make the title "Goals" white.

------------------------------------------------
13) GENERAL RULES

- Keep all existing functionality intact unless explicitly requested above.
- No routing changes.
- No data model changes.
- No new dependencies unless absolutely necessary.
- Preserve the current defense-style design language.

Output:
- List all modified files
- Provide minimal diff summary
- Confirm which items were completed