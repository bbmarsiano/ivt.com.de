'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, Globe2, Sparkles, TrendingUp } from 'lucide-react';

export default function WhyNowPage() {
  const { language, t } = useLanguage();

  const opportunities = [
    {
      icon: Zap,
      title: { de: 'Digitale Transformation', en: 'Digital Transformation' },
      description: {
        de: 'Die digitale Revolution bietet unprecedented Möglichkeiten',
        en: 'The digital revolution offers unprecedented opportunities',
      },
    },
    {
      icon: Globe2,
      title: { de: 'Globale Vernetzung', en: 'Global Connectivity' },
      description: {
        de: 'Weltweite Zusammenarbeit ist einfacher als je zuvor',
        en: 'Worldwide collaboration is easier than ever',
      },
    },
    {
      icon: Sparkles,
      title: { de: 'Innovation Boom', en: 'Innovation Boom' },
      description: {
        de: 'Noch nie war die Zeit so reif für Innovation',
        en: 'Never has the time been more ripe for innovation',
      },
    },
    {
      icon: TrendingUp,
      title: { de: 'Wachstumsmarkt', en: 'Growth Market' },
      description: {
        de: 'Attraktive Marktchancen und Wachstumspotenzial',
        en: 'Attractive market opportunities and growth potential',
      },
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
            <h1 className="mb-6">{t.pages.whyNow.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.whyNow.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {opportunities.map((opportunity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
                        <opportunity.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {opportunity.title[language]}
                        </h3>
                        <p className="text-muted-foreground">
                          {opportunity.description[language]}
                        </p>
                      </div>
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
