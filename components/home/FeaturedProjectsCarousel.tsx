'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import type { Project } from '@/lib/types/content';
import { ChevronLeft, ChevronRight, Star, ArrowRight } from 'lucide-react';

interface FeaturedProjectsCarouselProps {
  projects: Project[];
}

export function FeaturedProjectsCarousel({ projects: featuredProjects }: FeaturedProjectsCarouselProps) {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredProjects.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === featuredProjects.length - 1 ? 0 : prev + 1));
  };

  if (featuredProjects.length === 0) return null;

  const currentProject = featuredProjects[currentIndex];
  if (!currentProject) return null;

  const title = language === 'de' ? currentProject.title_de : currentProject.title_en;
  const summary = language === 'de' ? currentProject.summary_de : currentProject.summary_en;
  const industryLabel = t.pages.projects.industries[currentProject.industry];
  const statusLabel = t.pages.projects.statuses[currentProject.status];

  const statusBaseClasses =
    'inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide border shadow-sm z-20';
  const statusVariantClasses =
    currentProject.status === 'ongoing'
      ? 'bg-[#B45309]/90 text-white border-[#B45309]/60'
      : currentProject.status === 'completed'
      ? 'bg-[#0F5132]/90 text-white border-[#0F5132]/60'
      : currentProject.status === 'planned'
      ? 'bg-[#0B3D91]/90 text-white border-[#0B3D91]/60'
      : 'bg-white/10 text-white border-white/30';

  return (
    <div className="relative">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/projects/${currentProject.slug}`}>
              <Card className="ivt-frame ivt-frame-hover ivt-card-hover relative overflow-hidden rounded-xl border border-white/20 transition-all duration-200 min-h-[320px]">
                {/* Background image */}
                <div className="absolute inset-0">
                  <img
                    src={currentProject.thumbnail}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-l from-black/80 via-black/60 to-transparent" />
                </div>

                {/* Foreground content */}
                <div className="relative z-10 flex min-h-[320px] items-stretch">
                  <div className="ml-auto flex w-full max-w-xl flex-col justify-center p-8 md:p-10 text-white">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <Badge variant="secondary">{industryLabel}</Badge>
                    </div>
                    <h3 className="mb-4 text-2xl font-semibold line-clamp-2 text-white">
                      {title}
                    </h3>
                    <p className="mb-6 line-clamp-3 leading-relaxed text-white/70">
                      {summary}
                    </p>
                    <div className="mb-6 flex flex-wrap gap-2">
                      {currentProject.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-black/40 text-white/70"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-end">
                      <Button
                        variant="outline"
                        className="group inline-flex items-center gap-2 bg-white/5 text-white/80 border-white/20 hover:bg-white hover:text-black hover:border-black/10 transition-colors duration-200"
                      >
                        {t.pages.projects.learnMore}
                        <ArrowRight className="ivt-icon-md group-hover:translate-x-0.5 transition-transform duration-150" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </AnimatePresence>

        {featuredProjects.length > 1 && (
          <div className="mt-4 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center w-10 h-10 rounded-md overflow-hidden border border-white/15 bg-white/5 text-white/80 hover:bg-white hover:text-black hover:border-white/40 transition-colors duration-200"
              onClick={goToPrevious}
            >
              <ChevronLeft className="ivt-icon-md text-current" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="flex items-center justify-center w-10 h-10 rounded-md overflow-hidden border border-white/15 bg-white/5 text-white/80 hover:bg-white hover:text-black hover:border-white/40 transition-colors duration-200"
              onClick={goToNext}
            >
              <ChevronRight className="ivt-icon-md text-current" />
            </Button>
          </div>
        )}
      </div>

      {featuredProjects.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {featuredProjects.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to project ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
