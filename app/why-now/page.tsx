'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import {
  Landmark,
  Zap,
  Building2,
  Users,
  Sparkles,
  TrendingUp,
  BarChart3,
  Target,
} from 'lucide-react';

const REASONS = [
  { key: '1', icon: Landmark },
  { key: '2', icon: Zap },
  { key: '3', icon: Building2 },
  { key: '4', icon: Users },
  { key: '5', icon: Sparkles },
] as const;

const STAT_ICONS: LucideIcon[] = [TrendingUp, BarChart3, Target];

export default function WhyNowPage() {
  const { t } = useLanguage();
  const p = t.pages.whyNow as Record<string, string>;

  return (
    <div className="flex flex-col">
      <section className="section-spacing relative overflow-hidden bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.whyNow.title}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {t.pages.whyNow.intro}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REASONS.map(({ key, icon: Icon }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-white/10 bg-black/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary text-sm font-bold">
                        {key}
                      </span>
                      <div className="p-2 rounded-lg bg-primary/10 w-fit">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {p[`reason${key}Title`]}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {p[`reason${key}Text`]}
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
            {p.statsHeading}
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
            {t.pages.whyNow.timelineTitle}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0">
              <div className="flex-1 flex flex-col items-center text-center md:border-r border-white/10 md:pr-6">
                <div className="rounded-full border-2 border-primary bg-primary/10 w-14 h-14 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-white">2024</span>
                </div>
                <p className="text-sm text-white/80">{t.pages.whyNow.timeline2024}</p>
              </div>
              <div className="hidden md:block flex-shrink-0 w-px self-stretch bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="flex-1 flex flex-col items-center text-center md:border-r border-white/10 md:px-6">
                <div className="rounded-full border-2 border-primary bg-primary/10 w-14 h-14 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-white">2025</span>
                </div>
                <p className="text-sm text-white/80">{t.pages.whyNow.timeline2025}</p>
              </div>
              <div className="hidden md:block flex-shrink-0 w-px self-stretch bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="flex-1 flex flex-col items-center text-center md:pl-6">
                <div className="rounded-full border-2 border-primary bg-primary/10 w-14 h-14 flex items-center justify-center mb-3">
                  <span className="text-lg font-bold text-white">2026</span>
                </div>
                <p className="text-sm text-white/80">{t.pages.whyNow.timeline2026}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="ivt-frame rounded-lg border border-white/10 bg-transparent px-6 py-10 max-w-2xl mx-auto"
          >
            <p className="text-xl text-white font-medium mb-6">
              {t.pages.whyNow.ctaTitle}
            </p>
            <Button asChild className="border border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/partners">{t.pages.whyNow.ctaButton}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
