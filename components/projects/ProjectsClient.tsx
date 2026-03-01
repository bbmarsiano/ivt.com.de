'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import type { Project } from '@/lib/types/content';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectFilters, FilterState } from '@/components/projects/ProjectFilters';
import { AlertCircle } from 'lucide-react';

interface ProjectsClientProps {
  initialProjects: Project[];
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const { t } = useLanguage();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    industry: 'all',
    status: 'all',
    sortBy: 'newest',
  });

  const filteredAndSortedProjects = useMemo(() => {
    let filtered = [...initialProjects];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((project) => {
        const titleMatch =
          project.title_de.toLowerCase().includes(searchLower) ||
          project.title_en.toLowerCase().includes(searchLower);
        const summaryMatch =
          project.summary_de.toLowerCase().includes(searchLower) ||
          project.summary_en.toLowerCase().includes(searchLower);
        const tagsMatch = project.tags.some((tag) =>
          tag.toLowerCase().includes(searchLower)
        );
        return titleMatch || summaryMatch || tagsMatch;
      });
    }

    if (filters.industry && filters.industry !== 'all') {
      filtered = filtered.filter(
        (project) => project.industry === filters.industry
      );
    }

    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((project) => project.status === filters.status);
    }

    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'newest':
          filtered.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          break;
        case 'featured':
          filtered.sort((a, b) => {
            if (a.featured === b.featured) return 0;
            return a.featured ? -1 : 1;
          });
          break;
        case 'title':
          filtered.sort((a, b) => a.title_en.localeCompare(b.title_en));
          break;
      }
    }

    return filtered;
  }, [initialProjects, filters]);

  return (
    <>
      <ProjectFilters filters={filters} onFilterChange={setFilters} />

      {filteredAndSortedProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedProjects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-16"
        >
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-muted p-4">
              <AlertCircle className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold mb-2">
            {t.pages.projects.noResults}
          </h3>
          <p className="text-muted-foreground">
            {t.pages.projects.noResultsDescription}
          </p>
        </motion.div>
      )}
    </>
  );
}
