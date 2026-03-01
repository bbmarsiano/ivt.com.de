'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { EventItem } from '@/lib/types/content';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';

interface EventDetailClientProps {
  event: EventItem;
}

export function EventDetailClient({ event }: EventDetailClientProps) {
  const { language } = useLanguage();

  const title = language === 'de' ? event.title_de : event.title_en;
  const description = language === 'de' ? event.description_de : event.description_en;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language === 'de' ? 'de-DE' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateRange = (startString: string, endString: string) => {
    const startDate = new Date(startString);
    const endDate = new Date(endString);

    if (startDate.toDateString() === endDate.toDateString()) {
      return `${formatDate(startString)}, ${formatTime(startString)} - ${formatTime(endString)}`;
    } else {
      return `${formatDate(startString)} - ${formatDate(endString)}`;
    }
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
              <Link href="/events">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {language === 'de' ? 'Zurück zu Events' : 'Back to Events'}
              </Link>
            </Button>

            <h1 className="mb-6">{title}</h1>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-5 w-5" />
                <span>{formatDateRange(event.start_at, event.end_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {event.cover && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={event.cover}
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
                <h2 className="text-3xl font-semibold mb-6">
                  {language === 'de' ? 'Beschreibung' : 'Description'}
                </h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
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
                      {language === 'de' ? 'Event-Details' : 'Event Details'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <Calendar className="h-4 w-4 mr-2" />
                          {language === 'de' ? 'Datum & Zeit' : 'Date & Time'}
                        </div>
                        <p className="font-semibold">{formatDateRange(event.start_at, event.end_at)}</p>
                      </div>
                      <div>
                        <div className="flex items-center text-sm text-muted-foreground mb-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          {language === 'de' ? 'Ort' : 'Location'}
                        </div>
                        <p className="font-semibold">{event.location}</p>
                      </div>
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
