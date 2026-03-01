import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { contentService } from '@/services/contentService';
import { EventDetailClient } from '@/components/events/EventDetailClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const language = 'de';
  const { slug } = await params;

  // Fetch event on the server
  const event = await contentService.getEventBySlugAsync(slug);

  if (!event) {
    return (
      <div className="section-spacing">
        <div className="section-container text-center">
          <h1 className="mb-4">
            {language === 'de' ? 'Event nicht gefunden' : 'Event not found'}
          </h1>
          <Button asChild>
            <Link href="/events">
              {language === 'de' ? 'Zurück zu Events' : 'Back to Events'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <EventDetailClient event={event} />;
}
