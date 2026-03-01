Open components/layout/Header.tsx

Goal:
1) Add a mobile hamburger menu (md:hidden) that actually opens and shows navigation links.
2) Keep desktop nav (md:flex) unchanged and working.
3) Improve "active link" styling (both desktop and mobile) in a clean corporate way.
4) Use existing menu items logic already present in Header (including siteSettings.header_menu fallback).
5) Support external links (http/https) same as existing behavior.
6) Do NOT change any CMS/Directus service code, routing, or other components. Header.tsx only.

Implementation details:
- Use shadcn/ui Sheet for mobile menu:
  import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
  import { Button } from "@/components/ui/button";
  import { Separator } from "@/components/ui/separator";
  import { Menu } from "lucide-react";
- Use Next.js hook for active link:
  import { usePathname } from "next/navigation";
- Mobile hamburger button:
  visible on mobile only: className="md:hidden"
  place it in the right-side controls row (near Intro + language toggle), without changing those buttons' functionality.
- Mobile sheet:
  side="right"
  Title should be localized via existing i18n (simple: DE="Menü", EN="Menu").
  Render a vertical list of all visible menu items in order.
  Each item should close the sheet on click.
  External links open in new tab with rel noopener.
- Active link polish:
  Compute isActive = pathname === href OR (href !== "/" AND pathname startsWith href + "/") for section pages.
  Desktop link classes:
    - active: text-primary
    - inactive: text-muted-foreground hover:text-primary
  Mobile link classes:
    - active: text-primary font-semibold
    - inactive: text-foreground/80 hover:text-primary
- Keep the existing "Mehr" desktop dropdown unchanged.
  In mobile menu, include all links (including those that are in "Mehr" on desktop) as a flat list (simple and reliable).

Return:
- Provide the full updated Header.tsx content (complete file), not just a snippet.
- Ensure no TypeScript errors.