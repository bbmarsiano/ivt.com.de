'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/i18n';
import type { Resource } from '@/lib/types/content';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Video, Download, BookOpen } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ResourceKind = 'document' | 'video' | 'download' | 'guide';

interface ProjectDownloadsGroup {
  projectSlug: string;
  projectTitle_de: string;
  projectTitle_en: string;
  resources: Resource[];
}

interface ResourcesPageClientProps {
  publicResources: Resource[];
  unlinkedPublicDownloads: Resource[];
  projectDownloadsByProject: ProjectDownloadsGroup[];
}

type ActiveCategory = ResourceKind | 'all' | null;

export function ResourcesPageClient({
  publicResources,
  unlinkedPublicDownloads,
  projectDownloadsByProject,
}: ResourcesPageClientProps) {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<ActiveCategory>(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string | null>(null);
  const [videoModalTitle, setVideoModalTitle] = useState<string>('');
  const [videoModalMessage, setVideoModalMessage] = useState<string | null>(null);
  const resourcesListRef = useRef<HTMLDivElement>(null);

  const scrollToResourcesList = () => {
    setActiveCategory('all');
    setTimeout(() => {
      resourcesListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const categories = [
    {
      id: 'document' as const,
      icon: FileText,
      title: { de: 'Dokumente', en: 'Documents' },
      description: {
        de: 'Wichtige Dokumente und Berichte',
        en: 'Important documents and reports',
      },
    },
    {
      id: 'video' as const,
      icon: Video,
      title: { de: 'Videos', en: 'Videos' },
      description: {
        de: 'Lehrvideos und Präsentationen',
        en: 'Educational videos and presentations',
      },
    },
    {
      id: 'download' as const,
      icon: Download,
      title: { de: 'Downloads', en: 'Downloads' },
      description: {
        de: 'Materialien zum Herunterladen',
        en: 'Downloadable materials',
      },
    },
    {
      id: 'guide' as const,
      icon: BookOpen,
      title: { de: 'Leitfäden', en: 'Guides' },
      description: {
        de: 'Praktische Anleitungen',
        en: 'Practical guides',
      },
    },
  ];

  // Helper: localized text for a resource
  const getResourceTitle = (resource: Resource) =>
    language === 'en' ? resource.title_en : resource.title_de;

  const isPublicCategory = (resource: Resource) =>
    Array.isArray(resource.categories) && resource.categories.includes('public');

  // Filter public (non-gated, visible) resources by kind
  const filteredByKind = useMemo(() => {
    const base = publicResources.filter(
      (r) =>
        r.visible &&
        !r.gated &&
        r.kind != null &&
        isPublicCategory(r)
    );

    return {
      document: base.filter((r) => r.kind === 'document'),
      video: base.filter((r) => r.kind === 'video'),
      guide: base.filter((r) => r.kind === 'guide'),
    };
  }, [publicResources]);

  const downloadsProject = useMemo(
    () =>
      projectDownloadsByProject.map((group) => ({
        ...group,
        resources: group.resources.filter(
          (r) =>
            r.kind === 'download' &&
            r.visible &&
            !r.gated &&
            isPublicCategory(r)
        ),
      })),
    [projectDownloadsByProject]
  );

  const localizedNoResources =
    language === 'en' ? 'No resources yet.' : 'Noch keine Ressourcen vorhanden.';

  const showAll = activeCategory === 'all';

  const youtubeErrorMessage =
    language === 'en'
      ? 'Please add a YouTube URL in the External URL field.'
      : 'Bitte fügen Sie eine YouTube-URL im Feld External URL hinzu.';

  const getYouTubeEmbedUrl = (url: string | null | undefined): string | null => {
    if (!url) return null;
    try {
      const trimmed = url.trim();
      // Short link: https://youtu.be/ID
      let match = trimmed.match(/^https?:\/\/youtu\.be\/([^?&/]+)/i);
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }

      // Watch URL: https://www.youtube.com/watch?v=ID
      match = trimmed.match(/[?&]v=([^&]+)/i);
      if (match?.[1]) {
        return `https://www.youtube.com/embed/${match[1]}`;
      }

      // Embed URL: https://www.youtube.com/embed/ID
      match = trimmed.match(/^https?:\/\/(www\.)?youtube\.com\/embed\/([^?&/]+)/i);
      if (match?.[2]) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }

      // Shorts URL: https://www.youtube.com/shorts/ID
      match = trimmed.match(/^https?:\/\/(www\.)?youtube\.com\/shorts\/([^?&/]+)/i);
      if (match?.[2]) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }

      return null;
    } catch {
      return null;
    }
  };

  const openVideoModal = (resource: Resource) => {
    const embedUrl = getYouTubeEmbedUrl(resource.external_url || resource.externalUrl || null);
    setVideoModalTitle(getResourceTitle(resource));

    if (!embedUrl) {
      setVideoEmbedUrl(null);
      setVideoModalMessage(youtubeErrorMessage);
    } else {
      setVideoEmbedUrl(embedUrl);
      setVideoModalMessage(null);
    }

    setVideoModalOpen(true);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="section-spacing relative overflow-hidden">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="section-title mb-6">{t.pages.resources.title}</h1>
            <p className="text-xl text-muted-foreground">
              {t.pages.resources.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category cards + \"view all\" */}
      <section className="section-spacing">
        <div className="section-container space-y-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-xl font-semibold">
              {language === 'en' ? 'Resource categories' : 'Ressourcenkategorien'}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToResourcesList}
              className="hover:bg-transparent hover:text-white border-white/30"
            >
              {language === 'en' ? 'View all resources' : 'Alle Ressourcen ansehen'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const isActive = activeCategory === category.id || showAll;
              return (
                <motion.button
                  key={category.id}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      activeCategory === category.id ? null : category.id
                    )
                  }
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
                  aria-pressed={isActive}
                >
                  <Card
                    className={`h-full transition-all cursor-pointer ${
                      isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-lg'
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-4 p-3 rounded-lg bg-primary/10">
                          <category.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          {category.title[language]}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {category.description[language]}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Lists */}
      <section id="resources-list" ref={resourcesListRef} className="section-spacing pt-0">
        <div className="section-container space-y-10">
          <AnimatePresence initial={false}>
            {(showAll || activeCategory === 'document') && (
              <motion.div
                key="documents"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {language === 'en' ? 'Documents' : 'Dokumente'}
                </h2>
                {filteredByKind.document.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {localizedNoResources}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {filteredByKind.document.map((resource) => (
                      <li key={resource.id} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm text-white">
                          {getResourceTitle(resource)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {(showAll || activeCategory === 'video') && (
              <motion.div
                key="videos"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {language === 'en' ? 'Videos' : 'Videos'}
                </h2>
                {filteredByKind.video.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {localizedNoResources}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {filteredByKind.video.map((resource) => (
                      <li key={resource.id}>
                        <button
                          type="button"
                          onClick={() => openVideoModal(resource)}
                          className="flex items-center gap-3 text-left w-full text-sm text-white hover:text-white/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-sm">
                            {getResourceTitle(resource)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {(showAll || activeCategory === 'guide') && (
              <motion.div
                key="guides"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {language === 'en' ? 'Guides' : 'Leitfäden'}
                </h2>
                {filteredByKind.guide.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {localizedNoResources}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {filteredByKind.guide.map((resource) => (
                      <li key={resource.id} className="flex items-center gap-3">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm text-white">
                          {getResourceTitle(resource)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </motion.div>
            )}

            {(showAll || activeCategory === 'download') && (
              <motion.div
                key="downloads"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden space-y-6"
              >
                <h2 className="text-lg font-semibold mb-3">
                  {language === 'en' ? 'Downloads' : 'Downloads'}
                </h2>

                {/* Public downloads */}
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                    {language === 'en' ? 'Public downloads' : 'Öffentliche Downloads'}
                  </h3>
                  {unlinkedPublicDownloads.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {localizedNoResources}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {unlinkedPublicDownloads.map((resource) => (
                        <li key={resource.id} className="flex items-center gap-3">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                          <span className="text-sm text-white">
                            {getResourceTitle(resource)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Project downloads grouped by project */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium mb-1 text-muted-foreground">
                    {language === 'en'
                      ? 'Project-specific downloads'
                      : 'Projektspezifische Downloads'}
                  </h3>
                  {downloadsProject.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {localizedNoResources}
                    </p>
                  ) : (
                    downloadsProject.map((group) => {
                      const title =
                        language === 'en'
                          ? group.projectTitle_en
                          : group.projectTitle_de;

                      if (group.resources.length === 0) {
                        return null;
                      }

                      return (
                        <div key={group.projectSlug} className="space-y-1">
                          <h4 className="text-sm font-semibold">{title}</h4>
                          <ul className="space-y-1.5">
                            {group.resources.map((resource) => (
                              <li
                                key={resource.id}
                                className="flex items-center gap-3"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                <span className="text-sm text-white">
                                  {getResourceTitle(resource)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Video modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{videoModalTitle}</DialogTitle>
          </DialogHeader>
          {videoEmbedUrl ? (
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-md bg-black">
              <iframe
                src={videoEmbedUrl}
                title={videoModalTitle}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-white">
              {videoModalMessage}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

