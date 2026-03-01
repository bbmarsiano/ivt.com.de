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

  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
          >
            <Link href={`/projects/${currentProject.slug}`}>
              <Card className="overflow-hidden hover:shadow-xl transition-shadow border-2 border-transparent hover:border-primary/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                  <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                    <img
                      src={currentProject.thumbnail}
                      alt={title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        {t.pages.projects.featured}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-8 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline">{statusLabel}</Badge>
                      <Badge variant="secondary">{industryLabel}</Badge>
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 line-clamp-2">
                      {title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 mb-6 leading-relaxed">
                      {summary}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {currentProject.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Button variant="outline" className="group">
                      {t.pages.projects.learnMore}
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </Link>
          </motion.div>
        </AnimatePresence>

        {featuredProjects.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
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
