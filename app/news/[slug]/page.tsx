import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { contentService } from '@/services/contentService';
import { NewsDetailClient } from '@/components/news/NewsDetailClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface NewsDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsDetailPage({ params }: NewsDetailPageProps) {
  // Use default language (de) for server component
  const language = 'de';
  const { slug } = await params;

  // Fetch news item on the server
  const newsItem = await contentService.getNewsBySlugAsync(slug);

  if (!newsItem) {
    return (
      <div className="section-spacing">
        <div className="section-container text-center">
          <h1 className="mb-4">
            {language === 'de' ? 'News-Artikel nicht gefunden' : 'News article not found'}
          </h1>
          <Button asChild>
            <Link href="/news">
              {language === 'de' ? 'Zurück zu News' : 'Back to News'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <NewsDetailClient newsItem={newsItem} />;
}
