'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import type { Project, Testimonial, NewsPost, EventItem } from '@/lib/types/content';
import { ArrowRight, Users, Building2, Award } from 'lucide-react';
import { FeaturedProjectsCarousel } from '@/components/home/FeaturedProjectsCarousel';
import { TestimonialsSlider } from '@/components/home/TestimonialsSlider';
import { NewsTeaser } from '@/components/home/NewsTeaser';
import { EventsTeaser } from '@/components/home/EventsTeaser';

interface HomeClientProps {
  featuredProjects: Project[];
  featuredTestimonials: Testimonial[];
  latestNews: NewsPost[];
  upcomingEvents: EventItem[];
}

export function HomeClient({
  featuredProjects,
  featuredTestimonials,
  latestNews,
  upcomingEvents,
}: HomeClientProps) {
  const { language, t } = useLanguage();

  const highlights: Array<{
    icon: typeof Users;
    titleKey: 'collaborative' | 'hub' | 'madeInGermany';
  }> = [
    {
      icon: Users,
      titleKey: 'collaborative',
    },
    {
      icon: Building2,
      titleKey: 'hub',
    },
    {
      icon: Award,
      titleKey: 'madeInGermany',
    },
  ];

  const stats = [
    { value: '500+', label: { de: 'Projekte', en: 'Projects' } },
    { value: '150+', label: { de: 'Partner', en: 'Partners' } },
    { value: '50+', label: { de: 'Start-ups', en: 'Startups' } },
    { value: '€100M+', label: { de: 'Investitionen', en: 'Investments' } },
  ];

  return (
    <div className="flex flex-col">
      <section className="section-spacing relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="section-container relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-block mb-4 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium"
            >
              {language === 'de' ? 'Willkommen' : 'Welcome'}
            </motion.div>
            <h1 className="mb-6">
              {t.pages.home.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {t.pages.home.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/about">
                  {t.pages.home.cta}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">
                  {t.nav.contact}
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing bg-muted/30">
        <div className="section-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label[language]}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="mb-4">
              {language === 'de' ? 'Was uns auszeichnet' : 'What Sets Us Apart'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'de'
                ? 'Innovation Valley Thüringen bietet die perfekte Umgebung für Wachstum und Erfolg.'
                : 'Innovation Valley Thuringia provides the perfect environment for growth and success.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => {
              const highlightData = t.pages.home.highlights[highlight.titleKey];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-6 p-4 rounded-lg bg-primary/10">
                          <highlight.icon className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-3">
                          {highlightData.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {highlightData.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-spacing bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.pages.home.featuredProjects.title}</h2>
            <p className="text-lg text-muted-foreground">
              {t.pages.home.featuredProjects.subtitle}
            </p>
          </div>
          <FeaturedProjectsCarousel projects={featuredProjects} />
          <div className="flex justify-center mt-12">
            <Button asChild size="lg" variant="outline">
              <Link href="/projects">
                {t.pages.home.featuredProjects.viewAll}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.pages.home.testimonials.title}</h2>
            <p className="text-lg text-muted-foreground">
              {t.pages.home.testimonials.subtitle}
            </p>
          </div>
          <TestimonialsSlider testimonials={featuredTestimonials} />
        </div>
      </section>

      <section className="section-spacing bg-muted/30">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.pages.home.latestNews.title}</h2>
            <p className="text-lg text-muted-foreground">
              {t.pages.home.latestNews.subtitle}
            </p>
          </div>
          <NewsTeaser news={latestNews} />
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="mb-4">{t.pages.home.upcomingEvents.title}</h2>
            <p className="text-lg text-muted-foreground">
              {t.pages.home.upcomingEvents.subtitle}
            </p>
          </div>
          <EventsTeaser events={upcomingEvents} />
        </div>
      </section>

      <section className="section-spacing bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="mb-6 text-white">
              {t.pages.home.ctaSection.title}
            </h2>
            <p className="text-xl mb-8 text-white/90">
              {t.pages.home.ctaSection.description}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/about">
                {t.pages.home.ctaSection.button}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
