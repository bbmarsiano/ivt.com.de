'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useIntroOverlay } from '@/lib/hooks/useIntroOverlay';

interface IntroOverlayContextType {
  isOpen: boolean;
  hasSeenIntro: boolean;
  closeOverlay: () => void;
  openOverlay: () => void;
}

const IntroOverlayContext = createContext<IntroOverlayContextType | undefined>(undefined);

export function IntroOverlayProvider({ children }: { children: ReactNode }) {
  const introOverlay = useIntroOverlay();

  return (
    <IntroOverlayContext.Provider value={introOverlay}>
      {children}
    </IntroOverlayContext.Provider>
  );
}

export function useIntroOverlayContext() {
  const context = useContext(IntroOverlayContext);
  if (context === undefined) {
    throw new Error('useIntroOverlayContext must be used within an IntroOverlayProvider');
  }
  return context;
}
