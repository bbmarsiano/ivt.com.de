'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/i18n';
import type { NewsPost } from '@/lib/types/content';
import { Calendar, ArrowRight } from 'lucide-react';

interface NewsTeaserProps {
  news: NewsPost[];
}

export function NewsTeaser({ news: sortedNews }: NewsTeaserProps) {
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
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedNews.map((newsItem, index) => {
          const title = language === 'de' ? newsItem.title_de : newsItem.title_en;
          const summary = language === 'de' ? newsItem.summary_de : newsItem.summary_en;

          return (
            <motion.div
              key={newsItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/news/${newsItem.slug}`} className="group block h-full">
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary/20 h-full flex flex-col">
                  {newsItem.cover && (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={newsItem.cover}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(newsItem.published_at)}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed flex-1">
                      {summary}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {newsItem.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                      {t.pages.home.latestNews.readMore}
                      <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" variant="outline" className="group">
          <Link href="/news">
            {t.pages.home.latestNews.viewAll}
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
