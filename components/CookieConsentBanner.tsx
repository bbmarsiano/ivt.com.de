'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'ivt_cookie_consent';

export function CookieConsentBanner() {
  const { t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<string | null>(null);
  const [manageOpen, setManageOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    setConsent(stored);
  }, [mounted]);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEY, 'accepted');
    setConsent('accepted');
  };

  const handleManage = () => {
    setManageOpen((prev) => !prev);
  };

  if (!mounted || consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-banner-title"
      className="fixed bottom-4 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 rounded-lg border border-white/10 bg-black/95 px-6 py-5 shadow-xl backdrop-blur sm:bottom-6"
    >
      <div className="ivt-frame rounded-md border border-white/10 bg-black/30 p-4">
        <h2 id="cookie-banner-title" className="section-title mb-2 text-lg">
          {t.cookieBanner.title}
        </h2>
        <p className="text-sm leading-relaxed text-white/80">
          {t.cookieBanner.text}
        </p>

        {manageOpen && (
          <p className="mt-3 text-sm text-white/60">
            {t.cookieBanner.manageNote}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button size="sm" onClick={handleAccept} className="shrink-0">
            {t.cookieBanner.acceptAll}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleManage}
            className="shrink-0 border-white/30 text-gray-700 hover:bg-white/10 hover:text-white"
          >
            {t.cookieBanner.manageSettings}
          </Button>
          <Link
            href="/privacy"
            className="text-sm text-white/80 underline underline-offset-2 hover:text-white"
          >
            {t.cookieBanner.privacyLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
