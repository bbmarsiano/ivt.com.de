import { contentService } from '@/services/contentService';
import { PartnersPageClient } from '@/components/partners/PartnersPageClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function PartnersPage() {
  // Fetch partners on the server
  const partners = await contentService.getPartnersAsync();

  return <PartnersPageClient partners={partners} />;
}
