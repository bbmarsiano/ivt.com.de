Fix the missing Events teaser items on the homepage while keeping the "Upcoming events" logic.

Problem:
- Homepage Events teaser section renders empty, but the Events page link works.

Tasks:
1) Inspect services/contentService.ts getUpcomingEvents(limit):
   - Ensure it correctly reads events from lib/mock/events.ts
   - Ensure it correctly parses start_at and compares dates reliably
   - Avoid timezone pitfalls: use new Date(start_at).getTime() comparisons.

2) Update lib/mock/events.ts to ensure there are always 2–3 upcoming events relative to "today":
   - Add events with start_at in the future (e.g., within next 30–90 days).
   - Keep bilingual DE/EN fields.

3) Ensure homepage EventsTeaser:
   - Shows a friendly empty state if still no events (should not happen after mock update).
   - Otherwise displays 2–3 upcoming events with date + location + title.

4) Keep i18n translations intact.
5) Do not change the overall design; only fix the data and logic.

Deliverable:
- Homepage shows upcoming events cards/items again.
- getUpcomingEvents(limit) reliably returns future events.
