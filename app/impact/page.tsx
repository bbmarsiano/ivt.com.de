'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  TrendingUp,
  Building2,
  Lightbulb,
  Network,
  BarChart3,
  Target,
  Leaf,
} from 'lucide-react';

const AREAS = [
  { key: '1', icon: Briefcase },
  { key: '2', icon: TrendingUp },
  { key: '3', icon: Building2 },
  { key: '4', icon: Lightbulb },
  { key: '5', icon: Network },
] as const;

const STAT_ICONS: LucideIcon[] = [BarChart3, Target, Leaf];

const VISUAL_BARS = [
  { key: 'growth', width: 88, labelKey: 'visualGrowth' },
  { key: 'jobs', width: 76, labelKey: 'visualJobs' },
  { key: 'investment', width: 92, labelKey: 'visualInvestment' },
] as const;

export default function ImpactPage() {
  const { t } = useLanguage();
  const p = t.pages.impact as Record<string, string>;

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
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {p.intro}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <h2 className="section-title text-2xl font-semibold mb-8 text-center">
            {p.areasTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AREAS.map(({ key, icon: Icon }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-white/10 bg-black/20">
                  <CardContent className="p-6">
                    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {p[`area${key}Title`]}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {p[`area${key}Text`]}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <h2 className="section-title text-2xl font-semibold mb-8 text-center">
            {p.statsTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i, index) => {
              const StatIcon: LucideIcon | undefined = STAT_ICONS[i - 1];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full border-white/10 bg-black/20">
                    <CardContent className="p-6">
                      <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
                        {StatIcon ? <StatIcon className="h-6 w-6 text-primary" /> : null}
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed">
                        {p[`stat${i}`]}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <h2 className="section-title text-2xl font-semibold mb-8 text-center">
            {p.visualTitle}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 md:p-8 max-w-2xl mx-auto"
          >
            <div className="space-y-6">
              {VISUAL_BARS.map(({ key, width, labelKey }) => (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/90">{p[labelKey]}</span>
                    <span className="text-white/70 tabular-nums">{width}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Card className="border-primary/30 bg-primary/5 overflow-hidden">
              <CardContent className="p-6 md:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                  {p.caseLabel}
                </p>
                <h3 className="section-title text-xl font-semibold mb-3">
                  {p.caseTitle}
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {p.caseTeaser}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
