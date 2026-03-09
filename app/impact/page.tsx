'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';

export default function ImpactPage() {
  const { language, t } = useLanguage();

  const impactStats = [
    {
      value: '500+',
      label: { de: 'Projekte unterstützt', en: 'Projects supported' },
    },
    {
      value: '€100M+',
      label: { de: 'Investitionen vermittelt', en: 'Investments facilitated' },
    },
    {
      value: '2,000+',
      label: { de: 'Arbeitsplätze geschaffen', en: 'Jobs created' },
    },
    {
      value: '50+',
      label: { de: 'Start-ups gegründet', en: 'Startups founded' },
    },
  ];

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
            <h1 className="section-title mb-6">{t.pages.impact.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.impact.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {impactStats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label[language]}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="ivt-frame rounded-lg border border-white/10 bg-black/20 px-6 py-6 md:px-8 md:py-8">
              <div className="border-l-4 border-primary pl-6 md:pl-8">
                <h2 className="section-title mb-4">
                  {language === 'de' ? 'Unsere Wirkung' : 'Our Impact'}
                </h2>
                <p className="text-base leading-relaxed text-white/70 md:text-xl">
                  {language === 'de'
                    ? 'Innovation Valley Thüringen hat seit seiner Gründung einen bedeutenden Einfluss auf die regionale Innovationslandschaft. Durch die Unterstützung von Start-ups, die Förderung von Forschungsprojekten und die Vermittlung von Investitionen tragen wir zur wirtschaftlichen Entwicklung der Region bei.'
                    : 'Innovation Valley Thuringia has had a significant impact on the regional innovation landscape since its inception. By supporting startups, promoting research projects, and facilitating investments, we contribute to the economic development of the region.'}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
