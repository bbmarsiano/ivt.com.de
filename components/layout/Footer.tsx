'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import type { SiteSettings, MenuItem, FooterSection } from '@/lib/types/content';
import { getLocalizedField } from '@/lib/i18n/content';
import { BrandLogo } from '@/components/brand/BrandLogo';

interface FooterProps {
  siteSettings?: SiteSettings | null;
}

/**
 * Footer v2: Supports grouped sections with localized titles and CMS-configurable copyright
 * 
 * Structure:
 * - If footer_sections is provided: render N sections based on footer_sections order
 * - Each section title is localized (title_de/title_en)
 * - Links are matched from footer_menu by href (only visible=true)
 * - If footer_sections is null/empty: fallback to legacy 3-column layout
 * - Copyright text from footer_copyright (localized) or hardcoded fallback
 * 
 * Example site_settings JSON structure:
 * {
 *   "id": "1",
 *   "footer_menu": [
 *     { "label_de": "Startseite", "label_en": "Home", "href": "/", "visible": true },
 *     { "label_de": "Über uns", "label_en": "About", "href": "/about", "visible": true },
 *     { "label_de": "Projekte", "label_en": "Projects", "href": "/projects", "visible": true },
 *     { "label_de": "News", "label_en": "News", "href": "/news", "visible": true },
 *     { "label_de": "Kontakt", "label_en": "Contact", "href": "/contact", "visible": true }
 *   ],
 *   "footer_sections": [
 *     {
 *       "key": "navigation",
 *       "title_de": "Navigation",
 *       "title_en": "Navigation",
 *       "hrefs": ["/", "/about", "/projects"]
 *     },
 *     {
 *       "key": "resources",
 *       "title_de": "Ressourcen",
 *       "title_en": "Resources",
 *       "hrefs": ["/news", "/contact"]
 *     }
 *   ],
 *   "footer_copyright": {
 *     "de": "© 2024 Innovation Valley Thüringen. Alle Rechte vorbehalten.",
 *     "en": "© 2024 Innovation Valley Thüringen. All rights reserved."
 *   }
 * }
 */
export function Footer({ siteSettings }: FooterProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  // Get menu items from CMS or fallback to hardcoded
  const getMenuItems = (menuItems?: MenuItem[]): Array<{ href: string; label: string }> => {
    if (!menuItems || menuItems.length === 0) {
      return []; // Return empty if no CMS menu
    }

    return menuItems
      .filter((item) => item.visible !== false) // Filter visible items
      .map((item) => ({
        href: item.href,
        label: getLocalizedField<string>(item, 'label', language) || item.label_de || '',
      }));
  };

  // Build a map of href -> menu item for quick lookup
  const footerMenuMap = new Map<string, { href: string; label: string }>();
  if (siteSettings?.footer_menu) {
    getMenuItems(siteSettings.footer_menu).forEach((item) => {
      footerMenuMap.set(item.href, item);
    });
  }

  // Get copyright text (localized)
  const getCopyrightText = (): string => {
    if (siteSettings?.footer_copyright) {
      return language === 'en' ? siteSettings.footer_copyright.en : siteSettings.footer_copyright.de;
    }
    // Fallback to hardcoded translation
    return t.footer.copyright;
  };

  // Check if we should use grouped sections (v2) or legacy layout
  const useGroupedSections = siteSettings?.footer_sections && siteSettings.footer_sections.length > 0;

  if (useGroupedSections) {
    // Footer v2: Grouped sections
    const sections = siteSettings.footer_sections!;
    // Filter out empty sections
    const validSections = sections.filter((section: FooterSection) => {
      const sectionLinks = section.hrefs
        .map((href) => footerMenuMap.get(href))
        .filter((link): link is { href: string; label: string } => link !== undefined);
      return sectionLinks.length > 0;
    });

    // Calculate grid columns: 1 (logo) + N (sections)
    const totalColumns = 1 + validSections.length;
    const gridColsClass = totalColumns === 2 ? 'md:grid-cols-2' :
                          totalColumns === 3 ? 'md:grid-cols-3' :
                          totalColumns === 4 ? 'md:grid-cols-4' :
                          totalColumns === 5 ? 'md:grid-cols-5' :
                          'md:grid-cols-4'; // Default to 4

    return (
      <footer className="w-full border-t border-border bg-muted/40">
        <div className="section-container">
          <div className="py-12 md:py-16">
            <div className={`grid grid-cols-1 ${gridColsClass} gap-8 mb-8`}>
              {/* Logo/Brand column */}
              <div className="md:col-span-1">
                <BrandLogo
                  variant="light"
                  lockup="horizontal"
                  className="h-[60px] md:h-[72px] w-auto"
                />
              </div>

              {/* Dynamic sections based on footer_sections */}
              {validSections.map((section: FooterSection) => {
                const sectionTitle = getLocalizedField<string>(section, 'title', language) || section.title_de || '';
                // Match hrefs from section against footer_menu
                const sectionLinks = section.hrefs
                  .map((href) => footerMenuMap.get(href))
                  .filter((link): link is { href: string; label: string } => link !== undefined);

                return (
                  <div key={section.key}>
                    <h3 className="font-semibold text-sm mb-5">{sectionTitle}</h3>
                    <ul className="space-y-2.5">
                      {sectionLinks.map((link) => {
                        const isExternal = link.href.startsWith('http://') || link.href.startsWith('https://');
                        const isActive = !isExternal && pathname === link.href;
                        
                        // Base classes for all links
                        const baseClasses = "text-sm text-muted-foreground transition-all duration-200";
                        // Hover: underline + opacity change
                        const hoverClasses = "hover:text-foreground hover:underline hover:underline-offset-2";
                        // Active: font-semibold + underline + higher opacity
                        const activeClasses = isActive ? "font-semibold text-foreground underline underline-offset-2" : "";
                        // Focus: ring for accessibility
                        const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm";
                        
                        const linkClasses = `${baseClasses} ${hoverClasses} ${activeClasses} ${focusClasses}`;
                        
                        if (isExternal) {
                          return (
                            <li key={link.href}>
                              <a
                                href={link.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={linkClasses}
                              >
                                {link.label}
                              </a>
                            </li>
                          );
                        }

                        return (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              className={linkClasses}
                            >
                              {link.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            {/* Copyright */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground text-center">
                {getCopyrightText()}
              </p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Legacy Footer: Fallback to existing 3-column layout
  const cmsFooterMenu = siteSettings?.footer_menu
    ? getMenuItems(siteSettings.footer_menu)
    : [];

  const mainLinks = cmsFooterMenu.length > 0
    ? cmsFooterMenu.slice(0, 4) // First 4 items as main links
    : [
        { href: '/', label: t.nav.home },
        { href: '/about', label: t.nav.about },
        { href: '/projects', label: t.nav.projects },
        { href: '/partners', label: t.nav.partners },
      ];

  const secondaryLinks = cmsFooterMenu.length > 0
    ? cmsFooterMenu.slice(4) // Rest as secondary links
    : [
        { href: '/news', label: t.nav.news },
        { href: '/events', label: t.nav.events },
        { href: '/resources', label: t.nav.resources },
        { href: '/contact', label: t.nav.contact },
      ];

  const legalLinks = [
    { href: '/imprint', label: t.footer.imprint },
    { href: '/privacy', label: t.footer.privacy },
  ];

  return (
    <footer className="w-full border-t border-border bg-muted/40">
      <div className="section-container">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-1">
              <BrandLogo
                variant="light"
                lockup="horizontal"
                className="h-[60px] md:h-[72px] w-auto"
              />
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-5">Navigation</h3>
              <ul className="space-y-2.5">
                {mainLinks.map((link) => {
                  const isExternal = link.href.startsWith('http://') || link.href.startsWith('https://');
                  const isActive = !isExternal && pathname === link.href;
                  
                  const baseClasses = "text-sm text-muted-foreground transition-all duration-200";
                  const hoverClasses = "hover:text-foreground hover:underline hover:underline-offset-2";
                  const activeClasses = isActive ? "font-semibold text-foreground underline underline-offset-2" : "";
                  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm";
                  const linkClasses = `${baseClasses} ${hoverClasses} ${activeClasses} ${focusClasses}`;
                  
                  const LinkComponent = isExternal ? 'a' : Link;
                  const linkProps = isExternal
                    ? { href: link.href, target: '_blank', rel: 'noopener noreferrer', className: linkClasses }
                    : { href: link.href, className: linkClasses };

                  return (
                    <li key={link.href}>
                      <LinkComponent {...linkProps}>
                        {link.label}
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-5">Ressourcen</h3>
              <ul className="space-y-2.5">
                {secondaryLinks.map((link) => {
                  const isExternal = link.href.startsWith('http://') || link.href.startsWith('https://');
                  const isActive = !isExternal && pathname === link.href;
                  
                  const baseClasses = "text-sm text-muted-foreground transition-all duration-200";
                  const hoverClasses = "hover:text-foreground hover:underline hover:underline-offset-2";
                  const activeClasses = isActive ? "font-semibold text-foreground underline underline-offset-2" : "";
                  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm";
                  const linkClasses = `${baseClasses} ${hoverClasses} ${activeClasses} ${focusClasses}`;
                  
                  const LinkComponent = isExternal ? 'a' : Link;
                  const linkProps = isExternal
                    ? { href: link.href, target: '_blank', rel: 'noopener noreferrer', className: linkClasses }
                    : { href: link.href, className: linkClasses };

                  return (
                    <li key={link.href}>
                      <LinkComponent {...linkProps}>
                        {link.label}
                      </LinkComponent>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-5">Legal</h3>
              <ul className="space-y-2.5">
                {legalLinks.map((link) => {
                  const isActive = pathname === link.href;
                  const baseClasses = "text-sm text-muted-foreground transition-all duration-200";
                  const hoverClasses = "hover:text-foreground hover:underline hover:underline-offset-2";
                  const activeClasses = isActive ? "font-semibold text-foreground underline underline-offset-2" : "";
                  const focusClasses = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:rounded-sm";
                  const linkClasses = `${baseClasses} ${hoverClasses} ${activeClasses} ${focusClasses}`;
                  
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className={linkClasses}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              {getCopyrightText()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
