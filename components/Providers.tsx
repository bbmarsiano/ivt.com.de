'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { IntroOverlayProvider } from '@/lib/i18n/IntroOverlayContext';
import { IntroOverlay } from '@/components/IntroOverlay';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <IntroOverlayProvider>
        <IntroOverlay />
        {children}
        <CookieConsentBanner />
      </IntroOverlayProvider>
    </LanguageProvider>
  );
}
