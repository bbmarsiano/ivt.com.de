Scope: Projects page only.
Do NOT change filtering, sorting, routing, project cards, or CMS logic.

Goal:
Add a stylish helper UI element on the Projects page explaining how companies can join a project.

Content to include:

Heading:
"How to Join a Project"

Step-by-step guide:
1. Submit proposal via form.
2. Review and integration.
3. Execute with shared resources.

Preferred UX:
Implement this as a modern helper popup / slide-over / modal trigger on the Projects page.

Requirements:
1) Add a visible trigger button or helper chip in a suitable place near the top of the Projects page:
   - either in the hero section under the intro text
   - or near the search/filter section
2) Trigger label can be:
   - "How to Join a Project"
   or
   - "Join a Project"
3) When clicked, open a stylish popup/modal/drawer with the 3-step guide.
4) Design should match the current IVT style:
   - dark / premium / defense / enterprise
   - subtle border / tactical frame if already available
   - readable contrast
   - modern spacing
5) The steps should be clearly separated visually:
   - numbered items
   - or step cards
   - or a mini vertical timeline
6) Keep the implementation lightweight and reversible.
7) Do NOT add new business logic.
8) Do NOT connect this helper directly to the form yet.
9) Include EN and DE text support if the page already uses i18n.

Use these translations if needed:

EN
Title: "How to Join a Project"
Steps:
1. "Submit proposal via form."
2. "Review and integration."
3. "Execute with shared resources."

DE
Title: "Wie man an einem Projekt teilnimmt"
Steps:
1. "Vorschlag über das Formular einreichen."
2. "Prüfung und Integration."
3. "Umsetzung mit gemeinsamen Ressourcen."

Implementation suggestion:
- Reuse existing dialog/modal/sheet component if the project already has one.
- If not, create a simple modal using existing UI primitives.
- Add a close button.
- Keep the modal width moderate and mobile-friendly.

Output:
- show modified files
- minimal diff
- confirm no project page functionality changed