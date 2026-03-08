Task: Add background image "ivt_3.png" to the Hero section on the Home page ("/").

Constraints:
- Do NOT modify any functionality.
- Do NOT change video logic (if hero has intro video behavior).
- Do NOT remove existing components.
- Only adjust visual structure of the Hero section.

Steps:

1. Locate the Hero section inside the Home page (app/page.tsx or pages/index.tsx).
2. Wrap the existing Hero content in a relative container if not already:

   <section className="relative overflow-hidden">

3. Add a background layer using the image located at:
   /public/brand/background_imgs/ivt_3.png

   Implementation options (choose the cleanest existing pattern in the project):

   Option A (recommended for Tailwind):
   Add a div as the first child of Hero:

   <div className="absolute inset-0 z-0">
     <Image
       src="/brand/background_imgs/ivt_3.png"
       alt="Innovation Valley background"
       fill
       className="object-cover"
       priority
     />
   </div>

4. Add a subtle dark overlay above the image for text readability:

   <div className="absolute inset-0 bg-black/50 z-10" />

5. Wrap existing hero text content inside:

   <div className="relative z-20">
      (existing hero text and buttons here)
   </div>

6. Ensure:
   - Text remains centered as before.
   - No layout shift occurs.
   - Mobile responsiveness remains intact.
   - The image scales properly (object-cover).
   - No new dependencies added.

7. Do NOT change:
   - Featured Projects
   - Testimonials
   - News
   - Events
   - Any API logic

After implementation:
- Show the exact file modified.
- Provide minimal diff.
- Confirm no functional logic was changed.