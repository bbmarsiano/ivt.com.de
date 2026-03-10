'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { NewsPost } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';

const selectTriggerClass =
  'bg-white text-black border border-gray-600 rounded-md appearance-none pr-8 relative w-full [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500 [&>svg]:pointer-events-none';

interface NewsPageClientProps {
  news: NewsPost[];
}

export function NewsPageClient({ news }: NewsPageClientProps) {
  const { language, t } = useLanguage();
  const [dateFrom, setDateFrom] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');

  const uniqueTags = useMemo(() => {
    const set = new Set<string>();
    news.forEach((item) => (item.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [news]);

  const filteredNews = useMemo(() => {
    let list = news;
    if (dateFrom) {
      const from = new Date(dateFrom).getTime();
      list = list.filter((item) => new Date(item.published_at).getTime() >= from);
    }
    const q = nameQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const title = (language === 'de' ? item.title_de : item.title_en).toLowerCase();
        return title.includes(q);
      });
    }
    if (selectedTag !== 'all') {
      list = list.filter((item) => (item.tags || []).includes(selectedTag));
    }
    return list;
  }, [news, dateFrom, nameQuery, selectedTag, language]);

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
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.news.title}</h1>
            <p className="text-xl text-white">
              {t.pages.news.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 items-end">
              <div className="w-full">
                <Label htmlFor="news-filter-date" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.news.filterDate}
                </Label>
                <Input
                  id="news-filter-date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-white text-black placeholder:text-gray-500 border-gray-600"
                />
              </div>
              <div className="w-full">
                <Label htmlFor="news-filter-name" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.news.filterName}
                </Label>
                <Input
                  id="news-filter-name"
                  type="text"
                  placeholder={t.pages.news.filterNamePlaceholder}
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full bg-white text-black placeholder:text-gray-500 border-gray-600"
                />
              </div>
              <div className="w-full">
                <Label htmlFor="news-filter-tags" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.news.filterTags}
                </Label>
                <Select value={selectedTag} onValueChange={setSelectedTag}>
                  <SelectTrigger id="news-filter-tags" className={selectTriggerClass}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.pages.news.allTags}</SelectItem>
                    {uniqueTags.map((tag) => (
                      <SelectItem key={tag} value={tag}>
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredNews.map((item, index) => {
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
                          <Calendar className="ivt-icon-sm" />
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

