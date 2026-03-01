Implement the homepage intro video overlay behavior exactly as follows:

Goal:
- On first visit (per browser), show a full-screen intro video overlay that plays once.
- After the video ends (or user skips), hide overlay and show the homepage content.
- Store a flag in localStorage: ivt_intro_seen=true
- On subsequent visits, do NOT autoplay the intro; show homepage content immediately.
- The existing "Intro" button in the sticky header must replay the intro overlay anytime.

Video requirements:
- Use a placeholder local video file path for now: /intro/ivt-intro.mp4
- The video should autoplay muted, playsInline, and cannot loop.
- Provide a "Skip" button.
- Provide a subtle loading state while the video is loading.
- If the video fails to load, fallback to a static hero overlay (same text) with a "Continue" button.

Overlay content:
- Centered logo placeholder (use existing "IVT" text logo for now)
- Headline (translatable):
  DE: "Willkommen im Innovation Valley Thüringen – wo deutsche Unternehmen für zukunftsweisende Entwicklung, Umsetzung und Produktion zusammenkommen."
  EN: "Welcome to Innovation Valley Thüringen – Where German Companies Unite for Cutting-Edge Development, Implementation, and Production."
- Short subline (translatable):
  DE: "Thüringen als neues industrielles und innovatives Zentrum Deutschlands."
  EN: "Thuringia as Germany’s new industrial and innovation center."

UX / visuals:
- Overlay is full-screen, premium, minimal, with smooth fade-in/out animations (Framer Motion).
- When overlay closes, smoothly reveal the homepage (no layout jump).
- The "Intro" button in the header should be enabled once homepage is visible; clicking it opens overlay and replays the video from start.
- Add a small tooltip or aria-label for accessibility.

Implementation notes:
- Create a reusable component: components/IntroOverlay.tsx (or similar)
- Keep the logic in a small hook: lib/useIntroOverlay.ts (or similar)
- Make sure SSR does not break (localStorage access only on client).
- Do not integrate any backend or CMS yet.
- Keep existing i18n mechanism and add the new overlay text to translations.

Deliverable:
- Working intro overlay on homepage.
- Replay works from header on any page (global).
- Flag persists across reloads.
