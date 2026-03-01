'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Rocket, Users, Globe } from 'lucide-react';

export default function GoalsPage() {
  const { language, t } = useLanguage();

  const goals = [
    {
      icon: Target,
      title: { de: 'Innovation fördern', en: 'Foster Innovation' },
      description: {
        de: 'Schaffung eines Ökosystems, das Innovation und Kreativität fördert',
        en: 'Creating an ecosystem that fosters innovation and creativity',
      },
    },
    {
      icon: Rocket,
      title: { de: 'Start-ups stärken', en: 'Empower Startups' },
      description: {
        de: 'Unterstützung von Start-ups mit Ressourcen, Mentoring und Finanzierung',
        en: 'Supporting startups with resources, mentoring, and funding',
      },
    },
    {
      icon: Users,
      title: { de: 'Talente anziehen', en: 'Attract Talent' },
      description: {
        de: 'Anziehung und Bindung der besten Talente in der Region',
        en: 'Attracting and retaining the best talent in the region',
      },
    },
    {
      icon: Globe,
      title: { de: 'Globale Reichweite', en: 'Global Reach' },
      description: {
        de: 'Aufbau internationaler Partnerschaften und Netzwerke',
        en: 'Building international partnerships and networks',
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
            <h1 className="mb-6">{t.pages.goals.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.goals.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.map((goal, index) => (
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
                        <goal.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {goal.title[language]}
                        </h3>
                        <p className="text-muted-foreground">
                          {goal.description[language]}
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
