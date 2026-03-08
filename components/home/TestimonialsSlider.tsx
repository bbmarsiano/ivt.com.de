'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import type { Testimonial } from '@/lib/types/content';
import { Quote } from 'lucide-react';

interface TestimonialsSliderProps {
  testimonials: Testimonial[];
}

export function TestimonialsSlider({ testimonials: featuredTestimonials }: TestimonialsSliderProps) {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (featuredTestimonials.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === featuredTestimonials.length - 1 ? 0 : prev + 1
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredTestimonials.length]);

  if (featuredTestimonials.length === 0) return null;

  const currentTestimonial = featuredTestimonials[currentIndex];
  if (!currentTestimonial) return null;

  const quote = language === 'de' ? currentTestimonial.quote_de : currentTestimonial.quote_en;
  const authorTitle =
    language === 'de' ? currentTestimonial.author_title_de : currentTestimonial.author_title_en;

  return (
    <div className="relative">
      <div className="relative min-h-[300px] flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Card className="ivt-frame ivt-frame-hover ivt-card-hover border border-white/10 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-200">
              <CardContent className="p-8 md:p-12">
                <div className="max-w-4xl mx-auto">
                  <div className="flex justify-center mb-6">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Quote className="ivt-icon-lg text-primary" strokeWidth={1.5} />
                    </div>
                  </div>
                  <blockquote className="text-xl md:text-2xl text-center leading-relaxed mb-8 text-white/80">
                    "{quote}"
                  </blockquote>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold mr-4">
                        {currentTestimonial.author_name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-lg">
                          {currentTestimonial.author_name}
                        </p>
                        <p className="text-sm text-white/55">
                          {authorTitle}, {currentTestimonial.company_name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {featuredTestimonials.length > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {featuredTestimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
