'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import type { EventItem } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import type { Matcher } from 'react-day-picker';

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getEventDateSet(events: EventItem[]): Set<string> {
  const set = new Set<string>();
  events.forEach((event) => {
    const start = new Date(event.start_at);
    const end = new Date(event.end_at);
    const d = new Date(start);
    d.setHours(0, 0, 0, 0);
    const endDay = new Date(end);
    endDay.setHours(0, 0, 0, 0);
    while (d <= endDay) {
      set.add(toYMD(d));
      d.setDate(d.getDate() + 1);
    }
  });
  return set;
}

const calendarClassNames = {
  months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
  month: 'space-y-4',
  caption: 'flex justify-center pt-1 relative items-center',
  caption_label: 'text-sm font-medium text-white',
  nav: 'space-x-1 flex items-center',
  nav_button:
    'inline-flex items-center justify-center rounded-md text-sm font-medium h-7 w-7 bg-white/10 text-white border border-white/20 hover:bg-white/20',
  nav_button_previous: 'absolute left-1',
  nav_button_next: 'absolute right-1',
  table: 'w-full border-collapse space-y-1',
  head_row: 'flex',
  head_cell: 'text-white/70 rounded-md w-9 font-normal text-[0.8rem]',
  row: 'flex w-full mt-2',
  cell: 'h-9 w-9 text-center text-sm p-0 relative',
  day: 'h-9 w-9 p-0 font-normal text-white hover:bg-white/20 rounded-md aria-selected:opacity-100',
  day_today: 'bg-white/20 text-white',
  day_selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
  day_outside: 'text-white/40 opacity-50',
  day_disabled: 'text-white/30 opacity-50',
  day_event: 'bg-primary/60 text-white ring-1 ring-primary',
  day_hidden: 'invisible',
};

interface EventsPageClientProps {
  events: EventItem[];
}

export function EventsPageClient({ events }: EventsPageClientProps) {
  const { language, t } = useLanguage();
  const [dateFrom, setDateFrom] = useState('');
  const [nameQuery, setNameQuery] = useState('');
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const eventDateSet = useMemo(() => getEventDateSet(events), [events]);

  const eventDayMatcher: Matcher = (date) => eventDateSet.has(toYMD(date));

  const filteredEvents = useMemo(() => {
    let list = events;
    if (dateFrom) {
      const from = new Date(dateFrom).setHours(0, 0, 0, 0);
      list = list.filter((item) => new Date(item.start_at).setHours(0, 0, 0, 0) >= from);
    }
    const q = nameQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((item) => {
        const title = (language === 'de' ? item.title_de : item.title_en).toLowerCase();
        return title.includes(q);
      });
    }
    return list;
  }, [events, dateFrom, nameQuery, language]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'de' ? 'de-DE' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleCalendarSelect = (date: Date | undefined) => {
    if (!date) return;
    const ymd = toYMD(date);
    setDateFrom((prev) => (prev === ymd ? '' : ymd));
  };

  const selectedCalendarDate = dateFrom ? new Date(dateFrom + 'T12:00:00') : undefined;

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
            <h1 className="section-title mb-6">{t.pages.events.title}</h1>
            <p className="text-xl text-white">
              {t.pages.events.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <div className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 mb-8 max-w-sm mx-auto">
            <Calendar
              mode="single"
              selected={selectedCalendarDate}
              onSelect={handleCalendarSelect}
              month={calendarMonth}
              onMonthChange={setCalendarMonth}
              modifiers={{ event: eventDayMatcher }}
              modifiersClassNames={{ event: calendarClassNames.day_event }}
              classNames={calendarClassNames}
              showOutsideDays
            />
          </div>

          <div className="ivt-frame rounded-lg border border-white/10 bg-transparent p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-end">
              <div className="w-full">
                <Label htmlFor="events-filter-date" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.events.filterDate}
                </Label>
                <Input
                  id="events-filter-date"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full bg-white text-black placeholder:text-gray-500 border-gray-600"
                />
              </div>
              <div className="w-full">
                <Label htmlFor="events-filter-name" className="mb-2 block text-sm font-medium text-white">
                  {t.pages.events.filterName}
                </Label>
                <Input
                  id="events-filter-name"
                  type="text"
                  placeholder={t.pages.events.filterNamePlaceholder}
                  value={nameQuery}
                  onChange={(e) => setNameQuery(e.target.value)}
                  className="w-full bg-white text-black placeholder:text-gray-500 border-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredEvents.map((event, index) => {
              const title = language === 'de' ? event.title_de : event.title_en;
              const description = language === 'de' ? event.description_de : event.description_en;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Link href={`/events/${event.slug}`} className="group block h-full">
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                      {event.cover && (
                        <div className="aspect-video relative overflow-hidden bg-muted">
                          <img
                            src={event.cover}
                            alt={title}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className="flex gap-4 mb-3 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarIcon className="ivt-icon-sm mr-2" />
                            {formatDate(event.start_at)}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="ivt-icon-sm mr-2" />
                            {event.location}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                          {title}
                        </h3>
                        <p className="text-muted-foreground line-clamp-3">
                          {description}
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
