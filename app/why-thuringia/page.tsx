'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, TrendingUp, Users, Building2 } from 'lucide-react';

export default function WhyThuringiaPage() {
  const { language, t } = useLanguage();

  const reasons = [
    {
      icon: MapPin,
      title: { de: 'Zentrale Lage', en: 'Central Location' },
      description: {
        de: 'Im Herzen Deutschlands mit exzellenter Verkehrsanbindung',
        en: 'In the heart of Germany with excellent transportation connections',
      },
    },
    {
      icon: TrendingUp,
      title: { de: 'Wachsende Wirtschaft', en: 'Growing Economy' },
      description: {
        de: 'Dynamische Wirtschaftsentwicklung und starke Branchen',
        en: 'Dynamic economic development and strong industries',
      },
    },
    {
      icon: Users,
      title: { de: 'Talentpool', en: 'Talent Pool' },
      description: {
        de: 'Hochqualifizierte Fachkräfte und exzellente Universitäten',
        en: 'Highly qualified professionals and excellent universities',
      },
    },
    {
      icon: Building2,
      title: { de: 'Infrastruktur', en: 'Infrastructure' },
      description: {
        de: 'Moderne Infrastruktur und attraktive Förderprogramme',
        en: 'Modern infrastructure and attractive funding programs',
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
            <h1 className="mb-6">{t.pages.whyThuringia.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.whyThuringia.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {reasons.map((reason, index) => (
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
                        <reason.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {reason.title[language]}
                        </h3>
                        <p className="text-muted-foreground">
                          {reason.description[language]}
                        </p>
                      </div>
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
            className="aspect-video rounded-lg overflow-hidden bg-muted"
          >
            <img
              src="https://images.pexels.com/photos/208315/pexels-photo-208315.jpeg"
              alt="Thuringia"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
