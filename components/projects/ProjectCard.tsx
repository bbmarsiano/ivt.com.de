'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import type { Project } from '@/lib/types/content';
import { ArrowRight, Star } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const { language, t } = useLanguage();

  const title = language === 'de' ? project.title_de : project.title_en;
  const summary = language === 'de' ? project.summary_de : project.summary_en;
  const industryLabel = t.pages.projects.industries[project.industry];
  const statusLabel = t.pages.projects.statuses[project.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/projects/${project.slug}`}>
        <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 h-full group">
          <div className="aspect-video relative overflow-hidden bg-muted">
            <img
              src={project.thumbnail}
              alt={title}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
            {project.featured && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  {t.pages.projects.featured}
                </Badge>
              </div>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {statusLabel}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {industryLabel}
              </Badge>
            </div>
            <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
              {summary}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
            {(project.resourcesCount ?? 0) > 0 && (
              <div className="text-xs text-muted-foreground mb-4">
                {language === 'de' ? 'Ressourcen' : 'Resources'}: {project.resourcesCount}
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full inline-flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
            >
              {t.pages.projects.learnMore}
              <ArrowRight className="ivt-icon-md" />
            </Button>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
