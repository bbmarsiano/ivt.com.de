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
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.projects.title}</h1>
            <p className="text-white/70 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mt-6">
              {t.pages.projects.intro}
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
