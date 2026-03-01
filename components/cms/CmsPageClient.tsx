'use client';

import { useLanguage } from '@/lib/i18n';
import { getLocalizedField } from '@/lib/i18n/content';
import type { CmsPage } from '@/lib/types/content';

interface CmsPageClientProps {
  page: CmsPage;
}

/**
 * Client component that renders CMS page content with language selection
 * 
 * Security note: Content is from trusted Directus admin editors only.
 * For production, consider adding HTML sanitization if untrusted editors are allowed.
 */
export function CmsPageClient({ page }: CmsPageClientProps) {
  const { language } = useLanguage();
  
  const title = getLocalizedField<string>(page, 'title', language) || page.title_de || '';
  const content = getLocalizedField<string>(page, 'content', language) || page.content_de || '';

  return (
    <div className="section-spacing">
      <div className="section-container">
        <article className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold mb-8">{title}</h1>
          <div
            dangerouslySetInnerHTML={{ __html: content }}
            className="cms-content"
          />
        </article>
      </div>
    </div>
  );
}
