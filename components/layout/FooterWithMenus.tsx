/**
 * Server component wrapper that fetches site settings and passes to Footer
 */

import { contentService } from '@/services/contentService';
import { Footer } from './Footer';

export async function FooterWithMenus() {
  // Fetch site settings on server
  const siteSettings = await contentService.getSiteSettingsAsync();
  
  return <Footer siteSettings={siteSettings} />;
}
