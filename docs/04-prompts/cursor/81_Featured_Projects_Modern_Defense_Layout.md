Scope: Modify ONLY the "Featured Projects" section on the Home page.
Do NOT change carousel logic, slide data, navigation, or click behavior.

Goal:
Redesign the Featured Projects slide layout to match a modern defense/industrial aesthetic:
- Use the project image as a background
- Place text content on the right side
- Add a gradient overlay for readability
- Move carousel arrows BELOW the slide (not on the image)
- Maintain the site's dark design language (no white blocks)

Implementation:

1) Locate the Featured Projects component on the Home page.

2) Slide Layout
Replace the current image + text layout with a background-image container:

Structure:

Slide container:
- relative
- rounded-xl
- overflow-hidden
- min-h-[320px] (desktop larger if already used)

Background image:
- use project image as absolute background
- class:
  absolute inset-0 object-cover w-full h-full

Add gradient overlay above image for text readability:

overlay div:
- absolute inset-0
- bg-gradient-to-r from-black/70 via-black/50 to-transparent

3) Text content block

Create a right-aligned content container:

- relative z-10
- ml-auto
- max-w-md
- p-8
- text-white

Title:
- text-xl font-semibold text-white

Description:
- text-white/70 leading-relaxed

Icons / metadata:
- text-white/60

4) Carousel Controls

Move arrow controls BELOW the slide container.

Create a control row under the carousel:

container:
- flex items-center justify-end gap-3 mt-4

Arrow buttons style:
- rounded-md
- border border-white/15
- bg-white/5
- text-white/80
- hover:bg-white hover:text-black
- transition-colors duration-200

Ensure these controls trigger the existing carousel actions (do not change logic).

5) Section Title

Ensure section header remains consistent:

Title:
"Featured Projects"
- text-white/90
- font-bold

Subtitle if exists:
- text-white/60

6) Constraints

Do NOT change:
- project data
- click behavior
- routing
- carousel logic

Only modify styling and layout.

Output:
- list modified files
- minimal diff
- confirm carousel functionality unchanged.