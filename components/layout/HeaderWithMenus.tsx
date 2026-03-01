/**
 * Server component wrapper that fetches site settings and passes to Header
 * 
 * Verification:
 * curl -s -H "Authorization: Bearer $DIRECTUS_TOKEN" \
 *   "http://localhost:8055/items/site_settings?fields=id,header_menu,footer_menu" | jq
 */

import { contentService } from '@/services/contentService';
import { Header } from './Header';

export async function HeaderWithMenus() {
  // Fetch site settings on server
  const siteSettings = await contentService.getSiteSettingsAsync();
  
  return <Header siteSettings={siteSettings} />;
}
