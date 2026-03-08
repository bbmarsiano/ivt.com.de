'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import type { EventItem } from '@/lib/types/content';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

interface EventsTeaserProps {
  events: EventItem[];
}

export function EventsTeaser({ events: upcomingEvents }: EventsTeaserProps) {
  const { language, t } = useLanguage();

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

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="ivt-icon w-12 h-12 shrink-0 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">
          {language === 'de' ? 'Keine bevorstehenden Events' : 'No Upcoming Events'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {language === 'de'
            ? 'Aktuell sind keine Events geplant. Schauen Sie bald wieder vorbei!'
            : 'No events are currently scheduled. Check back soon!'}
        </p>
        <Button asChild variant="outline">
          <Link href="/events">{t.pages.home.upcomingEvents.viewAll}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingEvents.map((event, index) => {
          const title = language === 'de' ? event.title_de : event.title_en;
          const description = language === 'de' ? event.description_de : event.description_en;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/events/${event.slug}`} className="group block h-full">
                <Card className="ivt-frame ivt-frame-hover ivt-card-hover overflow-hidden border border-white/10 transition-all duration-200 h-full flex flex-col">
                  {event.cover && (
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img
                        src={event.cover}
                        alt={title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2 mb-4 leading-relaxed flex-1">
                      {description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="ivt-icon-sm mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {formatDateRange(event.start_at, event.end_at)}
                        </span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="ivt-icon-sm mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{event.location}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full inline-flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {t.pages.home.upcomingEvents.register}
                      <ArrowRight className="ivt-icon w-5 h-5 shrink-0 group-hover:translate-x-0.5 transition-transform duration-150" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="flex justify-center">
        <Button asChild size="lg" variant="outline" className="group">
          <Link href="/events" className="inline-flex items-center gap-2">
            {t.pages.home.upcomingEvents.viewAll}
            <ArrowRight className="ivt-icon-md group-hover:translate-x-0.5 transition-transform duration-150" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
