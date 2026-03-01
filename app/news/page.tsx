import { contentService } from '@/services/contentService';
import { NewsPageClient } from '@/components/news/NewsPageClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewsPage() {
  // Fetch news on the server
  const news = await contentService.getNewsAsync();

  return <NewsPageClient news={news} />;
}
