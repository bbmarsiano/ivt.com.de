import { contentService } from '@/services/contentService';
import { HomeClient } from '@/components/home/HomeClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch all content on the server
  const [featuredProjects, featuredTestimonials, latestNews, upcomingEvents] = await Promise.all([
    contentService.getFeaturedProjectsAsync(),
    contentService.getFeaturedTestimonialsAsync(),
    contentService.getLatestNewsAsync(3),
    contentService.getUpcomingEventsAsync(3),
  ]);

  return (
    <HomeClient
      featuredProjects={featuredProjects}
      featuredTestimonials={featuredTestimonials}
      latestNews={latestNews}
      upcomingEvents={upcomingEvents}
    />
  );
}
