'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import {
  Crosshair,
  FolderKanban,
  TrendingUp,
  Building2,
  Leaf,
  Users,
} from 'lucide-react';

const CORE_GOALS: { key: string; icon: LucideIcon }[] = [
  { key: '1', icon: Crosshair },
  { key: '2', icon: FolderKanban },
  { key: '3', icon: TrendingUp },
  { key: '4', icon: Building2 },
  { key: '5', icon: Leaf },
  { key: '6', icon: Users },
];

export default function GoalsPage() {
  const { t } = useLanguage();
  const p = t.pages.goals as Record<string, string>;

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
            <h1 className="section-title mb-6">{t.pages.goals.title}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {p.intro}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <h2 className="section-title text-2xl font-semibold mb-8 text-center">
            {p.coreTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CORE_GOALS.map(({ key, icon: Icon }, index) => (
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
                      {p[`goal${key}Title`]}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {p[`goal${key}Text`]}
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
          <h2 className="section-title text-2xl font-semibold mb-6 text-center">
            {p.strategicTitle}
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 md:p-8 max-w-4xl mx-auto"
          >
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-white/90 leading-relaxed"
                >
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  <span>{p[`strategic${i}`]}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <h2 className="section-title text-2xl font-semibold mb-3 text-center">
            {p.roadmapTitle}
          </h2>
          {p.roadmapIntro && (
            <p className="text-white/80 text-center max-w-2xl mx-auto mb-10">
              {p.roadmapIntro}
            </p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Desktop: horizontal roadmap with connector line */}
            <div className="hidden lg:block relative">
              <div className="absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="grid grid-cols-3 gap-6 items-start">
                {[
                  { phase: 1, node: true },
                  { phase: 2, node: true },
                  { phase: 3, node: true },
                ].map(({ phase }) => (
                  <div key={phase} className="relative flex flex-col items-center">
                    <div
                      className={
                        phase === 3
                          ? 'w-16 h-16 flex items-center justify-center rounded-full border-2 border-primary bg-primary/20 ring-2 ring-primary/30 mb-4 z-10 text-center'
                          : 'w-16 h-16 flex items-center justify-center rounded-full border-2 border-primary bg-primary/10 mb-4 z-10 text-center'
                      }
                    >
                      <span className="text-xs font-semibold text-white whitespace-nowrap">
                        {p[`phase${phase}Year`]}
                      </span>
                    </div>
                    <Card
                      className={
                        phase === 3
                          ? 'w-full border-primary/40 bg-black/30 shadow-lg shadow-primary/5'
                          : 'w-full border-white/10 bg-black/20'
                      }
                    >
                      <CardContent className={phase === 3 ? 'p-6 md:p-7' : 'p-5 md:p-6'}>
                        <h3 className="text-base font-semibold text-white mb-3">
                          {p[`phase${phase}Title`]}
                        </h3>
                        <ul className="space-y-2">
                          {[1, 2, 3, 4].map((i) => (
                            <li
                              key={i}
                              className="flex gap-2 text-sm text-white/80 leading-relaxed"
                            >
                              <span className="text-primary shrink-0">•</span>
                              {p[`phase${phase}Item${i}`]}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
            {/* Mobile: vertical stacked roadmap with left line */}
            <div className="lg:hidden space-y-0">
              {[1, 2, 3].map((phase) => (
                <div
                  key={phase}
                  className="relative pl-8 pb-8 last:pb-0 border-l-2 border-white/20 ml-3"
                >
                  <div
                    className={
                      phase === 3
                        ? 'absolute left-0 top-0 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-primary bg-primary/20 ring-2 ring-primary/30'
                        : 'absolute left-0 top-0 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-primary bg-primary/10'
                    }
                  />
                  <div className="pt-1">
                    <span className="text-xs font-bold text-primary">
                      {p[`phase${phase}Year`]}
                    </span>
                    <Card
                      className={
                        phase === 3
                          ? 'mt-2 border-primary/40 bg-black/30 shadow-lg shadow-primary/5'
                          : 'mt-2 border-white/10 bg-black/20'
                      }
                    >
                      <CardContent className={phase === 3 ? 'p-5' : 'p-4'}>
                        <h3 className="text-base font-semibold text-white mb-2">
                          {p[`phase${phase}Title`]}
                        </h3>
                        <ul className="space-y-1.5">
                          {[1, 2, 3, 4].map((i) => (
                            <li
                              key={i}
                              className="flex gap-2 text-sm text-white/80 leading-relaxed"
                            >
                              <span className="text-primary shrink-0">•</span>
                              {p[`phase${phase}Item${i}`]}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
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
              {p.ctaTitle}
            </p>
            <Button asChild className="border border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/partners">{p.ctaButton}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
