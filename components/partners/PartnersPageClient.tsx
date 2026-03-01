'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import type { Partner } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';

interface PartnersPageClientProps {
  partners: Partner[];
}

export function PartnersPageClient({ partners }: PartnersPageClientProps) {
  const { language, t } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  return (
    <div className="flex flex-col">
      <section className="section-spacing bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="mb-6">{t.pages.partners.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.partners.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="text-center mb-12">
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {language === 'de'
                ? 'Unsere Partner sind führende Unternehmen, Forschungseinrichtungen und Organisationen, die gemeinsam mit uns an der Zukunft arbeiten.'
                : 'Our partners are leading companies, research institutions, and organizations working with us to shape the future.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex flex-col items-center text-center">
                      {partner.logo && !imageErrors.has(partner.id) ? (
                        <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-4 overflow-hidden">
                          <img
                            src={partner.logo}
                            alt={partner.name}
                            className="w-full h-full object-contain"
                            onError={() => {
                              // Mark this image as failed to load, show fallback
                              setImageErrors((prev) => new Set(prev).add(partner.id));
                            }}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 rounded-lg bg-muted flex items-center justify-center mb-4">
                          <span className="text-2xl font-bold text-muted-foreground">
                            {partner.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <h3 className="text-xl font-semibold mb-2">
                        {partner.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {language === 'de' ? 'Strategischer Partner' : 'Strategic Partner'}
                      </p>
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 text-sm text-primary hover:underline"
                        >
                          {language === 'de' ? 'Website besuchen' : 'Visit Website'}
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
