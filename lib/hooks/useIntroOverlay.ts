'use client';

import { useState, useEffect, useCallback } from 'react';

const INTRO_SEEN_KEY = 'ivt_intro_seen';

export function useIntroOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem(INTRO_SEEN_KEY);
    setHasSeenIntro(seen === 'true');
    if (seen !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const closeOverlay = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(INTRO_SEEN_KEY, 'true');
    setHasSeenIntro(true);
  }, []);

  const openOverlay = useCallback(() => {
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    hasSeenIntro,
    closeOverlay,
    openOverlay,
  };
}
