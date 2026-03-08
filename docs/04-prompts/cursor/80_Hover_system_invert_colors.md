Scope: Styling ONLY. Do NOT change functionality, handlers, routing, state, or data.
Target: Header utility buttons (language switch + intro button). Fix icon/text color mismatch and implement consistent invert hover.

Tasks:

1) Locate the Header component where the language switch button and intro button are rendered.
   - Search for the globe/planet icon and the "EN/DE" text.
   - Search for the intro button icon and its label.

2) For BOTH buttons:
   A) Remove any hardcoded icon color classes like:
      - "text-white"
      - "fill-white"
      - "stroke-white"
      - "text-black"
      - "stroke-black"
      on the ICON component itself.
      Replace icon styling so it inherits the button text color:
      - Set icon className to "text-current" (and if applicable "stroke-current fill-current").
      - Keep the icon size classes (w/h) as they are.

   B) Ensure the label text also inherits from the button:
      - Remove any label span class that forces a different text color than the button.
      - Keep font/spacing classes.

3) Apply a consistent invert-hover button style to these header utility buttons ONLY:
   Default state (dark, subtle):
     - background: bg-white/5
     - border: border border-white/10
     - text: text-white/80
   Hover state (invert):
     - background: bg-white
     - border: border-black/10 (or border-white/40 if already used)
     - text: text-black
   Focus-visible:
     - focus-visible:outline-none
     - focus-visible:ring-2 focus-visible:ring-white/20
   Transitions:
     - transition-colors duration-200 ease-out

   Keep existing padding/rounded sizes. Do NOT change button structure.

4) Ensure both icon and text switch together on hover (same color).
   - Icon must visually invert the same way as the text.
   - If the icon still remains white, ensure it has no explicit stroke/fill color and uses currentColor.

5) Do NOT change anything outside these header utility buttons.

Output:
- Show modified file(s).
- Provide minimal diff.
- Confirm no behavior changes.