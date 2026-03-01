'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useIntroOverlayContext } from '@/lib/i18n/IntroOverlayContext';
import { Globe, Play, Menu, X } from 'lucide-react';
import type { SiteSettings, MenuItem } from '@/lib/types/content';
import { getLocalizedField } from '@/lib/i18n/content';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';

interface HeaderProps {
  siteSettings?: SiteSettings | null;
}

export function Header({ siteSettings }: HeaderProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { openOverlay, hasSeenIntro } = useIntroOverlayContext();

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 4);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  // Use CMS menu if available, otherwise fallback to hardcoded
  const cmsNavItems = siteSettings?.header_menu
    ? getMenuItems(siteSettings.header_menu)
    : [];

  const navItems = cmsNavItems.length > 0
    ? cmsNavItems
    : [
        { href: '/', label: t.nav.home },
        { href: '/about', label: t.nav.about },
        { href: '/projects', label: t.nav.projects },
        { href: '/partners', label: t.nav.partners },
        { href: '/news', label: t.nav.news },
        { href: '/events', label: t.nav.events },
      ];

  const moreItems = [
    { href: '/resources', label: t.nav.resources },
    { href: '/why-thuringia', label: t.nav.whyThuringia },
    { href: '/why-now', label: t.nav.whyNow },
    { href: '/impact', label: t.nav.impact },
    { href: '/goals', label: t.nav.goals },
    { href: '/contact', label: t.nav.contact },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de');
  };

  const isExternalHref = (href: string): boolean =>
    href.startsWith('http://') || href.startsWith('https://');

  const normalizePath = (value: string): string => {
    const noQuery = value.split('?')[0]?.split('#')[0] || '/';
    if (noQuery !== '/' && noQuery.endsWith('/')) {
      return noQuery.slice(0, -1);
    }
    return noQuery;
  };

  const isActiveLink = (href: string): boolean => {
    if (isExternalHref(href)) {
      return false;
    }
    const normalizedHref = normalizePath(href);
    const normalizedPathname = normalizePath(pathname || '/');
    if (normalizedHref === '/') {
      return normalizedPathname === '/';
    }
    return (
      normalizedPathname === normalizedHref ||
      normalizedPathname.startsWith(`${normalizedHref}/`)
    );
  };

  // Mobile menu: flat list including desktop nav and "Mehr" links.
  // De-duplicate by href while preserving first occurrence order.
  const allMobileItems = [...navItems, ...moreItems].filter(
    (item, index, arr) => arr.findIndex((i) => i.href === item.href) === index
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 h-16 md:h-20 transition-shadow duration-200 ${
        scrolled ? 'shadow-sm' : 'shadow-none'
      }`}
    >
      <div className="section-container h-full">
        <div className="flex items-center h-full justify-between">
          <div className="flex items-center">
            <BrandLogo
              variant="light"
              lockup="horizontal"
              className="h-[60px] md:h-[72px]"
              priority
            />
          </div>

          <nav className="hidden md:flex items-center space-x-5">
            {navItems.map((item) => {
              const isExternal = isExternalHref(item.href);
              const isActive = isActiveLink(item.href);
              const desktopLinkBase =
                'relative text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-full after:origin-left after:bg-primary after:transition-transform after:duration-200';
              
              if (isExternal) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${desktopLinkBase} text-muted-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100`}
                  >
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${desktopLinkBase} ${
                    isActive
                      ? 'text-primary after:scale-x-100'
                      : 'text-muted-foreground hover:text-primary after:scale-x-0 hover:after:scale-x-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div className="relative group">
              <button
                type="button"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-1 py-1 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {t.nav.more}
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 rounded-lg border border-border bg-popover shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200">
                <div className="py-2">
                  {moreItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`block px-4 py-2.5 text-sm transition-colors rounded-sm mx-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        isActiveLink(item.href)
                          ? 'text-primary bg-accent/50 font-medium'
                          : 'text-popover-foreground hover:bg-accent hover:text-primary'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center space-x-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="md:hidden"
                  aria-label={language === 'de' ? 'Menü öffnen' : 'Open menu'}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BrandLogo variant="light" lockup="icon" className="h-6 w-auto" />
                    <span className="text-sm font-medium">{language === 'de' ? 'Menü' : 'Menu'}</span>
                  </div>
                  <SheetClose asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={language === 'de' ? 'Menü schließen' : 'Close menu'}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </SheetClose>
                </div>
                <Separator className="my-4" />
                <nav className="flex flex-col gap-1">
                  {allMobileItems.map((item) => {
                    const isExternal = isExternalHref(item.href);
                    const isActive = isActiveLink(item.href);
                    const mobileLinkClasses = `min-h-11 px-3 py-2.5 rounded-md text-sm transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                      isActive
                        ? 'text-primary font-semibold'
                        : 'text-foreground/80 hover:text-primary'
                    }`;

                    if (isExternal) {
                      return (
                        <a
                          key={item.href}
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={mobileLinkClasses}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.label}
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={mobileLinkClasses}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <Separator className="my-4" />
                <div className="flex flex-col space-y-3 rounded-lg border border-border bg-muted/30 p-3">
                  {hasSeenIntro && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        openOverlay();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start"
                      aria-label={language === 'de' ? 'Intro-Video erneut abspielen' : 'Replay intro video'}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {t.intro.replayButton}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleLanguage}
                    className="w-full justify-start"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="text-sm font-medium">{language.toUpperCase()}</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden md:flex items-center space-x-2">
              {hasSeenIntro && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openOverlay}
                  className="text-sm"
                  aria-label={language === 'de' ? 'Intro-Video erneut abspielen' : 'Replay intro video'}
                >
                  <Play className="h-4 w-4 mr-1" />
                  {t.intro.replayButton}
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-1"
              >
                <Globe className="h-4 w-4" />
                <span className="text-sm font-medium">{language.toUpperCase()}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
