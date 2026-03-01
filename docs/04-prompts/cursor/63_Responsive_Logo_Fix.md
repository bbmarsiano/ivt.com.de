Open components/brand/BrandLogo.tsx

We are fixing logo sizing to make it fully responsive.

STRICT RULES:
- Do not change props.
- Do not change mapping logic.
- Only modify how next/image is rendered.
- Make it responsive and controlled via className height.
- Keep layout stable.

-----------------------------------
STEP 1: Remove fixed width and height
-----------------------------------

Find the <Image /> component.

Remove:
width={...}
height={...}

-----------------------------------
STEP 2: Replace Image with responsive config
-----------------------------------

Use this exact configuration:

<Image
  src={src}
  alt="Innovation Valley Thüringen"
  width={0}
  height={0}
  sizes="100vw"
  style={{ width: "auto", height: "100%" }}
  priority={priority}
  className="object-contain"
/>

-----------------------------------
STEP 3:
Do not modify outer container.
-----------------------------------

Return full updated BrandLogo.tsx file.