'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { NewsPost } from '@/lib/types/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar } from 'lucide-react';

interface NewsDetailClientProps {
  newsItem: NewsPost;
}

export function NewsDetailClient({ newsItem }: NewsDetailClientProps) {
  const { language } = useLanguage();

  const title = language === 'de' ? newsItem.title_de : newsItem.title_en;
  const summary = language === 'de' ? newsItem.summary_de : newsItem.summary_en;

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
          >
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/news">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'de' ? 'Zurück zu News' : 'Back to News'}
              </Link>
            </Button>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(newsItem.published_at)}</span>
            </div>

            <h1 className="mb-6">{title}</h1>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {newsItem.cover && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={newsItem.cover}
                      alt={title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                    {summary}
                  </p>
                  {/* If content fields are added later, they would go here */}
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="sticky top-24"
              >
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                      {language === 'de' ? 'Tags' : 'Tags'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {newsItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
