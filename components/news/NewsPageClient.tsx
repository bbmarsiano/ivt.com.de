'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { NewsPost } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

interface NewsPageClientProps {
  news: NewsPost[];
}

export function NewsPageClient({ news }: NewsPageClientProps) {
  const { language, t } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

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
            <h1 className="mb-6">{t.pages.news.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.news.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {news.map((item, index) => {
              const title = language === 'de' ? item.title_de : item.title_en;
              const summary = language === 'de' ? item.summary_de : item.summary_en;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/news/${item.slug}`} className="group block h-full">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      {item.cover && (
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img
                            src={item.cover}
                            alt={title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(item.published_at)}</span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3">
                          {summary}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
