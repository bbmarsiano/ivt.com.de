import { contentService } from '@/services/contentService';
import { HomeClient } from '@/components/home/HomeClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch all content on the server
  const [featuredProjects, featuredTestimonials] = await Promise.all([
    contentService.getFeaturedProjectsAsync(),
    contentService.getFeaturedTestimonialsAsync(),
  ]);

  return (
    <HomeClient
      featuredProjects={featuredProjects}
      featuredTestimonials={featuredTestimonials}
    />
  );
}
