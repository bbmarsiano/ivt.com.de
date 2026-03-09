Scope: Home page component only.

Goal:
Temporarily hide the following sections from rendering on the Home page while keeping their code in the file:

- Latest News
- Upcoming Events

These sections should remain in the codebase but not appear in the UI.

Implementation:

1) Locate the Home page component where the sections are rendered.

2) Find the section block for:
- Latest News
- Upcoming Events

3) Wrap the entire JSX blocks for these sections in JSX comments so they are not rendered.

Example pattern:

{/* 
<section>
  ...existing Latest News section code...
</section>
*/}

and

{/* 
<section>
  ...existing Upcoming Events section code...
</section>
*/}

4) Do NOT delete any code.
5) Do NOT modify section logic.
6) Do NOT modify data fetching.

Only comment out the rendering blocks.

Output:
- show modified file(s)
- minimal diff