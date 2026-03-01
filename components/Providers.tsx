'use client';

import { ReactNode } from 'react';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { IntroOverlayProvider } from '@/lib/i18n/IntroOverlayContext';
import { IntroOverlay } from '@/components/IntroOverlay';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <IntroOverlayProvider>
        <IntroOverlay />
        {children}
      </IntroOverlayProvider>
    </LanguageProvider>
  );
}
