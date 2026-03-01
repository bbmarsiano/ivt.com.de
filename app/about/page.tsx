import { contentService } from '@/services/contentService';
import { AboutClient } from '@/components/about/AboutClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AboutPage() {
  // Fetch about content and team on the server
  const [aboutContent, team] = await Promise.all([
    contentService.getAboutContentAsync(),
    contentService.getAllTeamAsync(),
  ]);

  return <AboutClient aboutContent={aboutContent} team={team} />;
}
