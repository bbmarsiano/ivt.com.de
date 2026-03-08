'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const values = [
    {
      icon: Target,
      title: { de: 'Mission', en: 'Mission' },
      description: {
        de: 'Thüringen als führenden Innovationsstandort etablieren.',
        en: 'Establish Thuringia as a leading innovation hub.',
      },
    },
    {
      icon: Users,
      title: { de: 'Zusammenarbeit', en: 'Collaboration' },
      description: {
        de: 'Förderung von Partnerschaften zwischen Wirtschaft, Wissenschaft und Politik.',
        en: 'Fostering partnerships between business, science, and government.',
      },
    },
    {
      icon: Lightbulb,
      title: { de: 'Innovation', en: 'Innovation' },
      description: {
        de: 'Unterstützung innovativer Ideen und Technologien.',
        en: 'Supporting innovative ideas and technologies.',
      },
    },
    {
      icon: Award,
      title: { de: 'Exzellenz', en: 'Excellence' },
      description: {
        de: 'Höchste Qualitätsstandards in allen Bereichen.',
        en: 'Highest quality standards in all areas.',
      },
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

    </div>
  );
}
