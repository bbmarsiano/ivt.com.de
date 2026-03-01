'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import type { Project } from '@/lib/types/content';
import { ProjectsClient } from '@/components/projects/ProjectsClient';

interface ProjectsPageClientProps {
  initialProjects: Project[];
}

export function ProjectsPageClient({ initialProjects }: ProjectsPageClientProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col">
      <section className="section-spacing bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="mb-6">{t.pages.projects.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.projects.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-spacing">
        <div className="section-container">
          <ProjectsClient initialProjects={initialProjects} />
        </div>
      </section>
    </div>
  );
}
