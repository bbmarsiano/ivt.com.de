'use client';

import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import type { TeamMember, AboutContent } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Lightbulb, Award, Mail, Linkedin } from 'lucide-react';
import { ABOUT_HERO_FALLBACK_IMAGE } from '@/lib/data/mock-data';

interface AboutClientProps {
  aboutContent: AboutContent;
  team: TeamMember[];
}

export function AboutClient({ aboutContent, team }: AboutClientProps) {
  const { language } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const reduceMotion = useReducedMotion();

  const values = [
    {
      icon: Target,
      title: { de: 'Innovation', en: 'Innovation' },
      description: {
        de: 'Förderung technologischer Fortschritte.',
        en: 'Driving technological advancements.',
      },
    },
    {
      icon: Users,
      title: { de: 'Integration', en: 'Integration' },
      description: {
        de: 'Unternehmen für gemeinsamen Erfolg zusammenführen.',
        en: 'Uniting companies for shared success.',
      },
    },
    {
      icon: Lightbulb,
      title: { de: 'Quality', en: 'Quality' },
      description: {
        de: "Verpflichtet zu 'Made in Germany'-Standards.",
        en: "Committed to 'Made in Germany' standards.",
      },
    },
    {
      icon: Award,
      title: { de: 'Sustainability', en: 'Sustainability' },
      description: {
        de: 'Umweltfreundliche Praktiken in allen Projekten.',
        en: 'Eco-friendly practices in all projects.',
      },
    },
  ];

  const milestonesHeading = { de: 'Meilensteine', en: 'Milestones' };

  const milestones = [
    {
      year: '2024',
      title: { de: 'Start von Innovation Valley Thüringen', en: 'Launch of Innovation Valley Thüringen' },
    },
    {
      year: '2025',
      title: { de: 'Erster Projektabschluss', en: 'First project completion' },
    },
    {
      year: '2026',
      title: { de: 'Ausbau strategischer Partnerschaften', en: 'Expansion of strategic partnerships' },
    },
    {
      year: '2030',
      title: { de: 'Etablierter integrierter Industrie-Hub', en: 'Established integrated industrial hub' },
    },
  ];

  // Sort team: by sort asc, then last_name
  const sortedTeam = [...team].sort((a, b) => {
    if (a.sort !== b.sort) {
      return a.sort - b.sort;
    }
    return a.last_name.localeCompare(b.last_name);
  });

  // Use Directus hero image if available, otherwise fallback
  const heroImageUrl = aboutContent.heroImageUrl || ABOUT_HERO_FALLBACK_IMAGE;

  // Convert YouTube watch/shorts URL to embed URL; pass through other embeddable URLs
  function getEmbedVideoUrl(url: string | null | undefined): string | null {
    if (!url || !url.trim()) return null;
    const trimmed = url.trim();
    const youtuBe = trimmed.match(/^https?:\/\/youtu\.be\/([^?&/]+)/i);
    if (youtuBe?.[1]) return `https://www.youtube.com/embed/${youtuBe[1]}`;
    const watch = trimmed.match(/[?&]v=([^&]+)/i);
    if (watch?.[1]) return `https://www.youtube.com/embed/${watch[1]}`;
    const embed = trimmed.match(/^https?:\/\/(www\.)?youtube\.com\/embed\/([^?&/]+)/i);
    if (embed?.[2]) return `https://www.youtube.com/embed/${embed[2]}`;
    const shorts = trimmed.match(/^https?:\/\/(www\.)?youtube\.com\/shorts\/([^?&/]+)/i);
    if (shorts?.[2]) return `https://www.youtube.com/embed/${shorts[2]}`;
    // Other CDN/embed URLs: use as-is if they look like iframe src
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return null;
  }

  const embedVideoSrc = getEmbedVideoUrl(aboutContent.embeddedVideoUrl ?? null);

  return (
    <div className="flex flex-col">
      {/* Hero Section: Title + Intro + Image */}
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="section-title mb-6">{language === 'de' ? aboutContent.title_de : aboutContent.title_en}</h1>
              <p className="section-subtitle text-xl leading-relaxed max-w-3xl">
                {language === 'de' ? aboutContent.intro_de : aboutContent.intro_en}
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="aspect-video rounded-lg overflow-hidden bg-muted"
            >
              <img
                src={heroImageUrl}
                alt={language === 'de' ? aboutContent.title_de : aboutContent.title_en}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Body Section: Mission + Vision (no duplicate title/intro) */}
      <section className="section-spacing">
        <div className="section-container">
          <div className="max-w-4xl mx-auto mb-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title mb-6">
                {language === 'de' ? 'Unsere Mission & Vision' : 'Our Mission & Vision'}
              </h2>
              <p className="section-subtitle text-lg leading-relaxed mb-4 max-w-3xl">
                {language === 'de' ? aboutContent.mission_de : aboutContent.mission_en}
              </p>
              <p className="section-subtitle text-lg leading-relaxed max-w-3xl">
                {language === 'de' ? aboutContent.vision_de : aboutContent.vision_en}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="mb-4 rounded-md border border-white/10 bg-white/5 p-2">
                        <value.icon className="ivt-icon-lg text-primary" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {value.title[language]}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description[language]}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Milestones timeline — premium panel */}
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <div className="ivt-frame rounded-lg border border-white/10 bg-black/30 px-6 py-8 md:px-8 md:py-10">
              <h2 className="section-title mb-10 text-center">
                {milestonesHeading[language]}
              </h2>

              {/* Desktop: horizontal timeline with line-draw */}
              <div className="hidden md:block relative">
                {/* Subtle highlight behind main line */}
                <div className="absolute left-0 right-0 top-8 h-px bg-white/5" aria-hidden />
                <motion.div
                  className="absolute left-0 right-0 top-8 h-px bg-white/20 origin-left"
                  initial={reduceMotion ? undefined : { scaleX: 0 }}
                  whileInView={reduceMotion ? undefined : { scaleX: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  aria-hidden
                />
                <div className="grid grid-cols-4 gap-4 relative">
                  {milestones.map((m, i) => (
                    <motion.div
                      key={m.year}
                      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      className="flex flex-col items-center text-center group"
                    >
                      <motion.div
                        initial={reduceMotion ? undefined : { scale: 0 }}
                        whileInView={reduceMotion ? undefined : { scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.35 + i * 0.12, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="rounded-full w-5 h-5 border-2 border-white/20 flex-shrink-0 mb-4 relative z-10 flex items-center justify-center bg-black/80 shadow-[0_0_16px_rgba(122,0,20,0.2)] group-hover:shadow-[0_0_20px_rgba(122,0,20,0.35)] transition-shadow duration-300"
                      >
                        <span className="rounded-full w-1.5 h-1.5 bg-primary" aria-hidden />
                      </motion.div>
                      <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-4 py-4 w-full transition-all duration-200 group-hover:border-white/20">
                        <p className="text-white font-bold text-lg mb-1">{m.year}</p>
                        <p className="text-white/60 text-sm leading-snug">{m.title[language]}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Mobile: vertical timeline with line-draw */}
              <div className="md:hidden relative pl-6">
                <div className="absolute left-[9px] top-4 bottom-4 w-px bg-white/5" aria-hidden />
                <motion.div
                  className="absolute left-[9px] top-4 bottom-4 w-px bg-white/20 origin-top"
                  initial={reduceMotion ? undefined : { scaleY: 0 }}
                  whileInView={reduceMotion ? undefined : { scaleY: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  viewport={{ once: true }}
                  aria-hidden
                />
                <div className="space-y-6">
                  {milestones.map((m, i) => (
                    <motion.div
                      key={m.year}
                      initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 + i * 0.12, ease: 'easeOut' }}
                      viewport={{ once: true }}
                      className="flex gap-4 relative group"
                    >
                      <motion.div
                        initial={reduceMotion ? undefined : { scale: 0 }}
                        whileInView={reduceMotion ? undefined : { scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.35 + i * 0.12, ease: 'easeOut' }}
                        viewport={{ once: true }}
                        className="absolute -left-6 top-2 rounded-full w-5 h-5 border-2 border-white/20 flex-shrink-0 z-10 flex items-center justify-center bg-black/80 shadow-[0_0_16px_rgba(122,0,20,0.2)] group-hover:shadow-[0_0_20px_rgba(122,0,20,0.35)] transition-shadow duration-300"
                      >
                        <span className="rounded-full w-1.5 h-1.5 bg-primary" aria-hidden />
                      </motion.div>
                      <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-4 py-4 flex-1 transition-all duration-200 group-hover:border-white/20">
                        <p className="text-white font-bold text-lg mb-1">{m.year}</p>
                        <p className="text-white/60 text-sm leading-snug">{m.title[language]}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {sortedTeam.length > 0 && (
        <section id="team" className="section-spacing relative overflow-hidden">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="section-title mb-4">
                {language === 'de' ? 'Unser Team' : 'Our Team'}
              </h2>
              <p className="section-subtitle text-lg max-w-2xl mx-auto">
                {language === 'de'
                  ? 'Die Experten hinter Innovation Valley Thüringen'
                  : 'The experts behind Innovation Valley Thuringia'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sortedTeam.map((member, index) => {
                const role = language === 'de' ? member.role_de : member.role_en;
                const bio = language === 'de' ? member.bio_de : member.bio_en;
                const fullName = `${member.first_name} ${member.last_name}`;

                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card className="h-full hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center text-center">
                          {member.avatarUrl && !imageErrors.has(member.id) ? (
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4 overflow-hidden">
                              <img
                                src={member.avatarUrl}
                                alt={fullName}
                                className="w-full h-full object-cover"
                                onError={() => {
                                  setImageErrors((prev) => new Set(prev).add(member.id));
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-4">
                              <span className="text-2xl font-bold text-muted-foreground">
                                {member.first_name.charAt(0).toUpperCase()}
                                {member.last_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <h3 className="text-xl font-semibold mb-1">
                            {fullName}
                          </h3>
                          <p className="text-sm text-primary font-medium mb-3">
                            {role}
                          </p>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                            {bio}
                          </p>
                          <div className="flex gap-3 justify-center">
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label={`Email ${fullName}`}
                              >
                                <Mail className="ivt-icon w-5 h-5 shrink-0 transition-colors duration-150" />
                              </a>
                            )}
                            {member.linkedin && (
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-muted-foreground hover:text-primary transition-colors"
                                aria-label={`${fullName} LinkedIn`}
                              >
                                <Linkedin className="ivt-icon w-5 h-5 shrink-0 transition-colors duration-150" />
                              </a>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {embedVideoSrc && (
        <section className="section-spacing relative overflow-hidden">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="section-title mb-8 text-center">
                A Day in Innovation Valley
              </h2>
              <div className="max-w-4xl mx-auto rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                <div className="aspect-video w-full">
                  <iframe
                    src={embedVideoSrc}
                    title="A Day in Innovation Valley"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

    </div>
  );
}
