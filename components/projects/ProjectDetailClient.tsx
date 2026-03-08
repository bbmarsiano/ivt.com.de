'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { Project, Resource } from '@/lib/types/content';
import { ApplyModal } from '@/components/projects/ApplyModal';
import { GalleryLightbox } from '@/components/projects/GalleryLightbox';
import { RequestAccessModal } from '@/components/resources/RequestAccessModal';
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  Download,
  Check,
  Star,
  Calendar,
  Users,
  Briefcase,
  Euro,
  ExternalLink,
  Lock,
  LockKeyhole,
  File,
  Globe,
} from 'lucide-react';
import {
  getResourceButtonLabel,
  getGatedHelperText,
  getResourceLinkProps,
  getResourceSourceLabel,
  shouldShowRequestAccess,
  isResourcePublic,
} from '@/lib/utils/resources';

interface ProjectDetailClientProps {
  project: Project;
  slug: string;
  resources: Resource[];
}

export function ProjectDetailClient({ project, slug, resources }: ProjectDetailClientProps) {
  const { language, t } = useLanguage();
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [requestAccessResource, setRequestAccessResource] = useState<Resource | null>(null);

  const title = language === 'de' ? project.title_de : project.title_en;
  const summary = language === 'de' ? project.summary_de : project.summary_en;
  const description = language === 'de' ? project.description_de : project.description_en;
  const eligibility = language === 'de' ? project.eligibility_de : project.eligibility_en;
  const coordinatorTitle =
    language === 'de' ? project.coordinator.title.de : project.coordinator.title.en;
  const industryLabel = t.pages.projects.industries[project.industry];
  const statusLabel = t.pages.projects.statuses[project.status];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div className="flex flex-col">
        <section className="section-spacing relative overflow-hidden">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Button variant="ghost" asChild className="mb-6">
                <Link href="/projects">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t.pages.projects.backToProjects}
                </Link>
              </Button>

              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="outline" className="text-sm">
                  {statusLabel}
                </Badge>
                <Badge variant="secondary" className="text-sm">
                  {industryLabel}
                </Badge>
                {project.featured && (
                  <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    {t.pages.projects.featured}
                  </Badge>
                )}
              </div>

              <h1 className="mb-6">{title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed mb-6">
                {summary}
              </p>

              <Button size="lg" onClick={() => setIsApplyModalOpen(true)}>
                {t.pages.projects.apply}
              </Button>
            </motion.div>
          </div>
        </section>

        <section className="section-spacing">
          <div className="section-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-semibold mb-6">
                    {t.pages.projects.projectDescription}
                  </h2>
                  <div className="prose prose-lg max-w-none">
                    {description.split('\n\n').map((paragraph, index) => (
                      <p key={index} className="text-muted-foreground leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-semibold mb-6">
                    {t.pages.projects.imageGallery}
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.images.map((image, index) => (
                      <motion.div
                        key={index}
                        className="aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
                        whileHover={{ scale: 1.02 }}
                        onClick={() => openLightbox(index)}
                      >
                        <img
                          src={image}
                          alt={`${title} - Image ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-semibold mb-6">
                    {t.pages.projects.eligibility}
                  </h2>
                  <Card>
                    <CardContent className="p-6">
                      <ul className="space-y-3">
                        {eligibility.map((item, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-5 w-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-semibold mb-6">
                    {language === 'de' ? 'Ressourcen' : 'Resources'}
                  </h2>
                  {resources.length > 0 ? (
                    <div className="space-y-3">
                      {resources.map((resource) => {
                        const resourceTitle = language === 'de' ? resource.title_de : resource.title_en;
                        const resourceDescription = language === 'de' ? resource.description_de : resource.description_en;
                        const isPublic = isResourcePublic(resource);
                        const showRequestAccess = shouldShowRequestAccess(resource);
                        const linkProps = getResourceLinkProps(resource, language);
                        const sourceLabel = getResourceSourceLabel(resource, language);
                        
                        return (
                          <Card key={resource.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-semibold">{resourceTitle}</h3>
                                    {showRequestAccess && (
                                      <Badge variant="outline" className="text-xs">
                                        <Lock className="h-3 w-3 mr-1" />
                                        {language === 'de' ? 'Gated' : 'Gated'}
                                      </Badge>
                                    )}
                                    {isPublic && (
                                      <Badge variant="secondary" className="text-xs">
                                        {language === 'de' ? 'Öffentlich' : 'Public'}
                                      </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">
                                      {resource.type}
                                    </Badge>
                                    {sourceLabel && (
                                      <Badge variant="outline" className="text-xs">
                                        {linkProps?.isFile ? (
                                          <File className="h-3 w-3 mr-1" />
                                        ) : (
                                          <Globe className="h-3 w-3 mr-1" />
                                        )}
                                        {sourceLabel}
                                      </Badge>
                                    )}
                                  </div>
                                  {resourceDescription && (
                                    <p className="text-sm text-muted-foreground mb-3">
                                      {resourceDescription}
                                    </p>
                                  )}
                                  {showRequestAccess && (
                                    <p className="text-xs text-muted-foreground italic mb-2">
                                      {getGatedHelperText(language)}
                                    </p>
                                  )}
                                </div>
                                {showRequestAccess ? (
                                  // Gated non-public resource: show "Request access" button (opens modal)
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRequestAccessResource(resource)}
                                    className="ml-4 flex-shrink-0"
                                  >
                                    <LockKeyhole className="h-4 w-4 mr-2" />
                                    {getResourceButtonLabel(resource, language)}
                                  </Button>
                                ) : linkProps ? (
                                  // Public or non-gated resource: show download/open button using linkProps
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="ml-4 flex-shrink-0"
                                  >
                                    <a
                                      href={linkProps.href}
                                      target={linkProps.target}
                                      rel={linkProps.rel}
                                      download={linkProps.download}
                                    >
                                      {linkProps.icon === 'download' ? (
                                        <>
                                          <Download className="h-4 w-4 mr-2" />
                                          {linkProps.label}
                                        </>
                                      ) : (
                                        <>
                                          <ExternalLink className="h-4 w-4 mr-2" />
                                          {linkProps.label}
                                        </>
                                      )}
                                    </a>
                                  </Button>
                                ) : (
                                  // No downloadUrl available: show disabled state
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    disabled
                                    className="ml-4 flex-shrink-0"
                                  >
                                    <FileText className="h-4 w-4 mr-2" />
                                    {language === 'de' ? 'Keine Datei' : 'No file'}
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center text-muted-foreground">
                        {language === 'de' ? 'Noch keine Ressourcen verfügbar.' : 'No resources available yet.'}
                      </CardContent>
                    </Card>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl font-semibold mb-6">
                    {t.pages.projects.coordinator}
                  </h2>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-2xl flex-shrink-0">
                          {project.coordinator.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-1">
                            {project.coordinator.name}
                          </h3>
                          <p className="text-muted-foreground mb-4">{coordinatorTitle}</p>
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Mail className="h-4 w-4 mr-2" />
                              <a
                                href={`mailto:${project.coordinator.email}`}
                                className="hover:text-primary transition-colors"
                              >
                                {project.coordinator.email}
                              </a>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Phone className="h-4 w-4 mr-2" />
                              <a
                                href={`tel:${project.coordinator.phone}`}
                                className="hover:text-primary transition-colors"
                              >
                                {project.coordinator.phone}
                              </a>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            asChild
                          >
                            <a href={`mailto:${project.coordinator.email}`}>
                              {t.pages.projects.contactCoordinator}
                            </a>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="sticky top-24"
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold mb-4">
                        {t.pages.projects.quickFacts}
                      </h3>
                      <div className="space-y-4">
                        {project.metrics?.budget && (
                          <div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Euro className="h-4 w-4 mr-2" />
                              {t.pages.projects.budget}
                            </div>
                            <p className="font-semibold">{project.metrics.budget}</p>
                          </div>
                        )}
                        {project.metrics?.duration && (
                          <div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Calendar className="h-4 w-4 mr-2" />
                              {t.pages.projects.duration}
                            </div>
                            <p className="font-semibold">{project.metrics.duration}</p>
                          </div>
                        )}
                        {project.metrics?.partners && (
                          <div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Users className="h-4 w-4 mr-2" />
                              {t.pages.projects.partners}
                            </div>
                            <p className="font-semibold">{project.metrics.partners}</p>
                          </div>
                        )}
                        {project.metrics?.jobs && (
                          <div>
                            <div className="flex items-center text-sm text-muted-foreground mb-1">
                              <Briefcase className="h-4 w-4 mr-2" />
                              {t.pages.projects.jobs}
                            </div>
                            <p className="font-semibold">{project.metrics.jobs}</p>
                          </div>
                        )}
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3">
                          {t.pages.projects.tags}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full mt-6"
                        size="lg"
                        onClick={() => setIsApplyModalOpen(true)}
                      >
                        {t.pages.projects.apply}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ApplyModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        projectTitle={title}
        projectSlug={slug}
      />

      {requestAccessResource && (
        <RequestAccessModal
          isOpen={!!requestAccessResource}
          onClose={() => setRequestAccessResource(null)}
          resource={requestAccessResource}
          projectSlug={slug}
        />
      )}

      <GalleryLightbox
        images={project.images}
        isOpen={isLightboxOpen}
        initialIndex={lightboxIndex}
        onClose={() => setIsLightboxOpen(false)}
      />
    </>
  );
}
