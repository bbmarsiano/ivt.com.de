import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { translations } from '@/lib/i18n';
import { contentService } from '@/services/contentService';
import { ProjectDetailClient } from '@/components/projects/ProjectDetailClient';

// Force dynamic rendering - no static caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  // Use default language (de) for server component
  const t = translations.de;
  const language = 'de';
  const { slug } = await params;

  // Fetch project and resources on the server
  const [project, resources] = await Promise.all([
    contentService.getProjectBySlugAsync(slug),
    contentService.getProjectResourcesAsync(slug),
  ]);

  if (!project) {
    return (
      <div className="section-spacing">
        <div className="section-container text-center">
          <h1 className="mb-4">
            {language === 'de' ? 'Projekt nicht gefunden' : 'Project not found'}
          </h1>
          <Button asChild>
            <Link href="/projects">
              {t.pages.projects.backToProjects}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ProjectDetailClient project={project} slug={slug} resources={resources} />;
}
