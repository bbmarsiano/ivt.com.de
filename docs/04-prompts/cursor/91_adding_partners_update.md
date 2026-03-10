Scope: Partners page only (/partners).
Do NOT change routing or existing partner card data fetching logic.
Only update page copy, styling, and add a partner inquiry CTA/form section.

Goals:

1) Update page heading and intro texts

Change:
- Title "Partners" -> "Partners and Companies"
- Title color -> white

Change subtitle text:
- "Our Network Partners"
-> "Highlight collaborations and build credibility."
- subtitle color -> white

Change the text above the partner cards:
- "Our partners are leading companies, research institutions, and organizations working with us to shape the future."
-> "A consortium of Thuringia and German-based companies committed to integrated project execution."

Keep this text visually consistent with the current site design.

------------------------------------------------
2) Add partner filters section above the partner cards

Add a filter/search section above the partner cards, visually matching the Projects page filter section.

Fields to include:
- Search partner name
- Location
- Activity / Expertise

Requirements:
- Use the same design language as the Projects page search/filter bar
- white labels
- white or transparent/dark defense-style framed container, matching the current site
- dropdown fields should visually match the Projects page filters
- do NOT implement advanced backend filtering unless there is already an existing pattern
- if no existing partner filtering logic exists, implement lightweight client-side filtering only on already loaded partner data

Suggested filter behavior:
- Search by partner/company name
- Filter by location
- Filter by activity/expertise

------------------------------------------------
3) Add a "Become a Partner" CTA section

Add a dedicated section below the partner cards or in another suitable place on the page.

Section title:
"Become a Partner"

Intro text:
"Form for inquiries: company name, contact, project interest."

Benefits block:
- Access to shared facilities in Thuringia.
- Funding opportunities for joint projects.
- Networking events for collaboration.

Design:
- premium card/panel consistent with current site
- readable white text
- modern enterprise / defense style
- responsive

Add a CTA button that reveals the inquiry form (inline or modal is acceptable, choose the cleaner existing pattern in the project).

------------------------------------------------
4) Add inquiry form UI

Form fields:
- Company name
- Contact
- Project interest

Requirements:
- add user-friendly labels
- modern styling consistent with the rest of the site
- after successful submit, show a success message:
  "Our team will contact you soon."
- do NOT invent backend endpoints if there is already an existing form submission pattern in the project; reuse existing API form architecture if possible
- if no reusable pattern exists, prepare the UI and connect it to a new internal API route later

------------------------------------------------
5) i18n

If the page uses i18n, also add German translations:

Title:
"Partners and Companies" -> "Partner und Unternehmen"

Subtitle:
"Highlight collaborations and build credibility."
-> "Kooperationen hervorheben und Glaubwürdigkeit stärken."

Text above cards:
"A consortium of Thuringia and German-based companies committed to integrated project execution."
-> "Ein Konsortium aus in Thüringen und Deutschland ansässigen Unternehmen, das sich einer integrierten Projektumsetzung verpflichtet hat."

Section title:
"Become a Partner"
-> "Partner werden"

Intro text:
"Form for inquiries: company name, contact, project interest."
-> "Anfrageformular: Firmenname, Kontakt, Projektinteresse."

Benefits:
- "Access to shared facilities in Thuringia."
  -> "Zugang zu gemeinsam genutzten Einrichtungen in Thüringen."
- "Funding opportunities for joint projects."
  -> "Fördermöglichkeiten für gemeinsame Projekte."
- "Networking events for collaboration."
  -> "Networking-Veranstaltungen für Zusammenarbeit."

Success message:
"Our team will contact you soon."
-> "Unser Team wird sich in Kürze mit Ihnen in Verbindung setzen."

Output:
- show modified files
- minimal diff
- clearly indicate whether filtering is client-side or reused from existing page logic