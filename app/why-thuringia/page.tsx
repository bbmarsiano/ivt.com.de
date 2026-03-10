'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MapPin,
  Sparkles,
  GraduationCap,
  Building2,
  Users,
  Handshake,
  Quote,
} from 'lucide-react';

const THURINGIA_MAP_EMBED_SRC =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_WHY_THURINGIA_MAP_EMBED_URL
    ? process.env.NEXT_PUBLIC_WHY_THURINGIA_MAP_EMBED_URL
    : 'https://www.openstreetmap.org/export/embed.html?bbox=9.5%2C50.0%2C12.5%2C51.8&layer=map&marker=51.0%2C11.0';

const ADVANTAGES = [
  { key: '1', icon: MapPin },
  { key: '2', icon: Sparkles },
  { key: '3', icon: GraduationCap },
  { key: '4', icon: Building2 },
  { key: '5', icon: Users },
  { key: '6', icon: Handshake },
] as const;

export default function WhyThuringiaPage() {
  const { t } = useLanguage();
  const p = t.pages.whyThuringia as Record<string, string>;

  return (
    <div className="flex flex-col">
      <section className="section-spacing relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: "url('/brand/background_imgs/ivt_3.png')",
          }}
        />
        <div className="section-container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.whyThuringia.title}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              {t.pages.whyThuringia.tagline}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <h2 className="section-title text-2xl font-semibold mb-8 text-center">
            {t.pages.whyThuringia.advantagesTitle}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVANTAGES.map(({ key, icon: Icon }, index) => (
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
                      {p[`advantage${key}Title`]}
                    </h3>
                    <p className="text-white/80 text-sm leading-relaxed">
                      {p[`advantage${key}Text`]}
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
          <h2 className="section-title text-2xl font-semibold mb-4">
            {t.pages.whyThuringia.mapHeading}
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl">
            {t.pages.whyThuringia.mapDescription}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="rounded-lg border border-white/10 overflow-hidden bg-black/20 aspect-video max-w-4xl"
          >
            <iframe
              title="Thuringia region map"
              src={THURINGIA_MAP_EMBED_SRC}
              className="w-full h-full min-h-[260px]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container max-w-3xl mx-auto">
          <motion.blockquote
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative pl-6 pr-4 py-6 border-l-4 border-primary rounded-r-lg bg-black/20 border border-white/10 border-l-primary"
          >
            <Quote className="absolute left-2 top-6 h-8 w-8 text-primary/40" aria-hidden />
            <p className="text-lg text-white/90 italic leading-relaxed">
              {t.pages.whyThuringia.quote}
            </p>
          </motion.blockquote>
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
              {t.pages.whyThuringia.ctaTitle}
            </p>
            <Button asChild className="border border-white/30 text-white hover:bg-white/10 hover:text-white">
              <Link href="/contact">{t.pages.whyThuringia.ctaButton}</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
