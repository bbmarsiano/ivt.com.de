Fix the runtime error: ChunkLoadError: Loading chunk app/page failed.

Constraints:
- Keep all existing UI/behavior.
- Do not integrate backend/CMS.
- Goal is to make the dev server stable in this environment (webcontainer) and remove unhandled chunk load errors.

Tasks:
1) Identify and fix likely causes:
   - Ensure no components imported by app/page.tsx are using dynamic import in a way that breaks chunk loading.
   - Ensure server/client boundaries are correct:
     - Any component using hooks (useState/useEffect/useContext) must be in a "use client" file.
     - Server components must not import client components indirectly through lib modules that reference window/localStorage.
   - Ensure lib/useIntroOverlay or i18n context only touches localStorage/window inside useEffect or guarded checks, and only in client components.

2) Stabilize imports:
   - Replace any dynamic/lazy imports used in the homepage route with static imports.
   - Avoid barrel exports that can confuse module boundaries; use direct imports where needed.

3) Add App Router error boundaries:
   - Create app/error.tsx (client component) to catch and display a friendly error with a “Reload” button.
   - Create app/loading.tsx to show a minimal loading UI.
   - If route groups exist, ensure they inherit these.

4) Clear build artifacts in-code:
   - Add a note in PROJECT_READY_FOR_CURSOR.md explaining that if ChunkLoadError occurs, delete .next and restart dev server.
   - If you can, ensure the dev environment triggers a clean rebuild (do not rely on stale chunks).

5) Verify:
   - Homepage (/) loads without ChunkLoadError.
   - Navigating across pages does not trigger missing chunk requests.
   - Intro overlay still works.

Deliverable:
- No ChunkLoadError when loading /.
- Add app/error.tsx and app/loading.tsx.
- Provide stable module graph for app/page.tsx.
