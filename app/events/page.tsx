import { contentService } from '@/services/contentService';
import { EventsPageClient } from '@/components/events/EventsPageClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EventsPage() {
  // Fetch events on the server
  const events = await contentService.getAllEventsAsync();

  return <EventsPageClient events={events} />;
}
