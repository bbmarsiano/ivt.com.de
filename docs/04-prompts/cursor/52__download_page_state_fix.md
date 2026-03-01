Fix UX state on /resources/download page: after auto-download starts, replace the “Your download is starting…” message with a “Download started” confirmation, while keeping the manual download button.

CONTEXT
Currently, when the magic link page validates the token and triggers the download automatically, the UI keeps showing:
"Your download is starting… If it doesn't start automatically..."
even after the download has already started.

IMPORTANT NOTE
We cannot reliably detect when a browser attachment download finishes, but we CAN update UI immediately after we trigger the download request.

REQUIREMENTS
1) After token validation succeeds and the page triggers auto-download, update the state so the top message changes to something like:
   - Title: "Download started"
   - Subtitle: "If you need it again, use the button below."
2) Keep the existing download button visible.
3) Ensure no infinite spinner and error states remain unchanged.
4) Do not expose /api/media/<file_id> in HTML.
5) Keep current behaviour: auto-download starts once per page load (avoid repeated triggering on rerenders).

IMPLEMENTATION GUIDANCE
- In the download page component, add a UI state enum, e.g.:
  'validating' | 'ready' | 'downloading' | 'started' | 'error' | 'expired'
- When validation returns valid and BEFORE triggering the download, set state to 'downloading'
- After triggering the download (e.g. setting window.location or clicking a hidden link/iframe), set state to 'started'
- If download trigger throws, show error.

Make minimal changes, keep existing structure.

DELIVERABLE
- Update the /resources/download page component to show “Download started” after initiating auto download.
- Provide a short list of files changed.
