'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { useIntroOverlayContext } from '@/lib/i18n/IntroOverlayContext';
import { Button } from '@/components/ui/button';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { X } from 'lucide-react';

export function IntroOverlay() {
  const { isOpen, closeOverlay } = useIntroOverlayContext();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      setIsLoading(true);
      setHasError(false);
      setVideoStarted(false);
      videoRef.current.load();
    }
  }, [isOpen]);

  const handleVideoCanPlay = () => {
    setIsLoading(false);
    if (videoRef.current && isOpen) {
      videoRef.current.play().catch(() => {
        setHasError(true);
      });
    }
  };

  const handleVideoPlay = () => {
    setVideoStarted(true);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleVideoEnd = () => {
    closeOverlay();
  };

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    closeOverlay();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-black"
          aria-label={t.intro.headline}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {!hasError ? (
              <>
                <video
                  ref={videoRef}
                  className="absolute inset-0 w-full h-full object-cover"
                  muted
                  playsInline
                  onCanPlay={handleVideoCanPlay}
                  onPlay={handleVideoPlay}
                  onError={handleVideoError}
                  onEnded={handleVideoEnd}
                  preload="auto"
                >
                  <source src="/intro/ivt-intro.mp4" type="video/mp4" />
                </video>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black"
                  >
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        <BrandLogo
                          variant="dark"
                          lockup="horizontal"
                          className="h-10 sm:h-12 md:h-14 w-auto mx-auto"
                          priority
                        />
                      </div>
                      <p className="text-white/60 text-sm">{t.intro.loading}</p>
                    </div>
                  </motion.div>
                )}

                {!isLoading && !videoStarted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  >
                    <div className="text-center max-w-4xl px-6">
                      <div className="mb-6 flex justify-center">
                        <BrandLogo
                          variant="dark"
                          lockup="horizontal"
                          className="h-10 sm:h-12 md:h-14 w-auto mx-auto"
                          priority
                        />
                      </div>
                      <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
                      >
                        {t.intro.headline}
                      </motion.h1>
                      <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl md:text-2xl text-white/80 leading-relaxed"
                      >
                        {t.intro.subline}
                      </motion.p>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-8 right-8"
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={handleSkip}
                    className="shadow-lg"
                  >
                    {t.intro.skip}
                    <X className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 text-center max-w-4xl px-6"
              >
                <div className="mb-6 flex justify-center">
                  <BrandLogo
                    variant="dark"
                    lockup="horizontal"
                    className="h-10 sm:h-12 md:h-14 w-auto mx-auto"
                    priority
                  />
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                  {t.intro.headline}
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-8 leading-relaxed">
                  {t.intro.subline}
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleSkip}
                  className="shadow-lg"
                >
                  {t.intro.continue}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
