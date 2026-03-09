'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import type { Project, Testimonial, NewsPost, EventItem } from '@/lib/types/content';
import { ArrowRight, Users, Building2, Award } from 'lucide-react';
import { FeaturedProjectsCarousel } from '@/components/home/FeaturedProjectsCarousel';
import { TestimonialsSlider } from '@/components/home/TestimonialsSlider';
import { NewsTeaser } from '@/components/home/NewsTeaser';
import { EventsTeaser } from '@/components/home/EventsTeaser';
import { CountUp } from '@/components/home/CountUp';

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

  const missionCopy =
    'Innovation Valley Thüringen serves as a dynamic integration environment for Thuringia-based and German companies. We focus on executing ongoing projects in technology and product development, ensuring 100% German-made quality from concept to production.';

  const highlightContent = {
    collaborative: {
      title: t.pages.home.highlights.collaborative.title,
      description: t.pages.home.highlights.collaborative.description,
    },
    hub: {
      title: t.pages.home.highlights.hub.title,
      description: t.pages.home.highlights.hub.description,
    },
    madeInGermany: {
      title: t.pages.home.highlights.madeInGermany.title,
      description: t.pages.home.highlights.madeInGermany.description,
    },
  };

  const featuredProjectsIntro = {
    title: 'Featured Projects',
  };

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
    { value: 500, prefix: '', suffix: '+', label: { de: 'Projekte', en: 'Projects' } },
    { value: 150, prefix: '', suffix: '+', label: { de: 'Partner', en: 'Partners' } },
    { value: 50, prefix: '', suffix: '+', label: { de: 'Start-ups', en: 'Startups' } },
    { value: 100, prefix: '€', suffix: 'M+', label: { de: 'Investitionen', en: 'Investments' } },
  ];

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b border-white/10 py-20 md:py-28 lg:py-36">
        <div className="pointer-events-none absolute left-[-40px] top-6 z-0 h-32 w-32 opacity-[0.12] md:h-40 md:w-40 select-none">
          <Image src="/brand/background_imgs/N_white.png" alt="" fill className="object-contain object-left-top deco-float" sizes="10rem" />
        </div>
        <div className="relative z-10">
          <div className="section-container">
            <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-6 py-8 md:px-8 md:py-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mx-auto max-w-5xl text-center"
            >
              <h1 className="section-title mx-auto mb-2 max-w-5xl text-3xl md:text-5xl lg:text-6xl leading-tight">
                {t.pages.home.heroPrimary}
              </h1>
              <h2 className="section-subtitle mx-auto mt-2 mb-10 max-w-4xl text-xl md:text-3xl leading-relaxed">
                {t.pages.home.heroSecondary}
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="hover:bg-white hover:text-gray-800">
                  <Link href="/about" className="inline-flex items-center gap-2">
                    {t.pages.home.ctaSection.title}
                    <ArrowRight className="ivt-icon-md" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="hover:bg-transparent hover:text-white border-white/30">
                  <Link href="/projects" className="inline-flex items-center gap-2">
                    {t.pages.home.ctaSection.viewStrategicProjects}
                  </Link>
                </Button>
              </div>
            </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-spacing relative overflow-hidden">
        <div className="pointer-events-none absolute right-[-40px] top-6 z-0 h-32 w-32 opacity-[0.1] md:h-40 md:w-40 select-none">
          <Image src="/brand/background_imgs/O_white.png" alt="" fill className="object-contain object-right-top deco-float" sizes="10rem" />
        </div>
        <div className="section-container relative z-10">
          <div className="ivt-frame mx-auto mb-12 max-w-5xl rounded-lg border border-white/10 bg-black/20 px-6 py-6 md:px-8 md:py-8">
            <div className="border-l-4 border-primary pl-6 md:pl-8">
            <p className="text-base leading-relaxed text-white/70 md:text-xl">
              {missionCopy}
            </p>
            </div>
          </div>
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
                <div className="text-4xl md:text-5xl font-bold text-white mb-2 [text-shadow:0_0_24px_rgba(122,0,20,0.25)]">
                  <CountUp target={stat.value} prefix={stat.prefix} suffix={stat.suffix} duration={1500} />
                </div>
                <div className="text-sm md:text-base text-muted-foreground">
                  {stat.label[language]}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing relative overflow-hidden">
        <div className="pointer-events-none absolute bottom-6 left-6 z-0 h-32 w-32 opacity-[0.1] md:h-40 md:w-40 select-none">
          <Image src="/brand/background_imgs/I_white.png" alt="" fill className="object-contain object-left-bottom deco-float" sizes="10rem" />
        </div>
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((highlight, index) => {
              const highlightData = highlightContent[highlight.titleKey];
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="ivt-frame ivt-frame-hover ivt-card-hover h-full transition-all duration-200">
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-6 rounded-md border border-white/10 bg-white/5 p-2">
                          <highlight.icon className="ivt-icon-lg text-primary" strokeWidth={1.5} />
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

      <section className="section-spacing relative overflow-hidden">
        <div className="pointer-events-none absolute right-[-32px] top-6 z-0 h-24 w-24 opacity-[0.07] md:h-32 md:w-32 select-none">
          <Image src="/brand/background_imgs/N_red.png" alt="" fill className="object-contain object-right-top" sizes="8rem" />
        </div>
        <div className="section-container relative z-10">
          <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-6 py-8 md:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{featuredProjectsIntro.title}</h2>
          </div>
          <FeaturedProjectsCarousel projects={featuredProjects} />
          <div className="flex justify-center mt-12">
            <Button asChild size="lg" variant="outline" className="group bg-white text-black border border-gray-400 hover:bg-transparent hover:text-white hover:border-white">
              <Link href="/projects" className="inline-flex items-center gap-2">
                {t.pages.home.featuredProjects.viewAll}
                <ArrowRight className="ivt-icon-md text-current transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
          </div>
        </div>
      </section>

      <section className="section-spacing relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-6 py-8 md:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.pages.home.testimonials.title}</h2>
            <p className="section-subtitle text-lg mt-2">
              {t.pages.home.testimonials.subtitle}
            </p>
          </div>
          <TestimonialsSlider testimonials={featuredTestimonials} />
          </div>
        </div>
      </section>

      {/* Latest News - temporarily hidden
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-6 py-8 md:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.pages.home.latestNews.title}</h2>
            <p className="section-subtitle text-lg mt-2">
              {t.pages.home.latestNews.subtitle}
            </p>
          </div>
          <NewsTeaser news={latestNews} />
          </div>
        </div>
      </section>
      */}

      {/* Upcoming Events - temporarily hidden
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container relative z-10">
          <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-6 py-8 md:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">{t.pages.home.upcomingEvents.title}</h2>
            <p className="section-subtitle text-lg mt-2">
              {t.pages.home.upcomingEvents.subtitle}
            </p>
          </div>
          <EventsTeaser events={upcomingEvents} />
          </div>
        </div>
      </section>
      */}

      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <div className="ivt-frame rounded-lg border border-white/10 bg-black/30 px-6 py-10 md:px-10 md:py-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="section-title mb-6">
              {t.pages.home.ctaSection.title}
            </h2>
            <p className="section-subtitle text-xl mb-8">
              {t.pages.home.ctaSection.description}
            </p>
            <Button size="lg" variant="secondary" asChild className="group bg-white text-black border border-gray-400 hover:bg-transparent hover:text-white hover:border-white">
              <Link href="/about" className="inline-flex items-center gap-2">
                {t.pages.home.ctaSection.button}
                <ArrowRight className="ivt-icon-md text-current transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
