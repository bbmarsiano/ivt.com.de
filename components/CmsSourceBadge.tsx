/**
 * CMS Source Badge (Development Only)
 * 
 * Displays whether the app is using Directus or Mocks.
 * Only visible in development mode.
 * 
 * This is a server component that determines the CMS source server-side.
 */

import { isDirectusEnabled, getDirectusUrl, getDirectusToken } from '@/lib/env.directus';

async function fetchLiveTitle(slug: string): Promise<string | null> {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  try {
    const url = getDirectusUrl();
    const token = getDirectusToken();
    
    if (!url) {
      return null;
    }

    const response = await fetch(
      `${url}/items/projects?filter[slug][_eq]=${slug}&fields=title_en&limit=1`,
      {
        cache: 'no-store',
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          : {
              'Content-Type': 'application/json',
            },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.data?.[0]?.title_en || null;
    }
  } catch (error) {
    // Silently fail - this is just for visual proof
  }

  return null;
}

export async function CmsSourceBadge() {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Server-side decision
  const enabled = isDirectusEnabled();
  const url = getDirectusUrl();
  const token = getDirectusToken();
  
  // Determine CMS source
  let source: 'DIRECTUS' | 'MOCKS' = 'MOCKS';
  let reason: string | null = null;

  if (enabled && url) {
    source = 'DIRECTUS';
    if (!token) {
      reason = 'public';
    }
  } else {
    if (!enabled) {
      reason = 'USE_DIRECTUS disabled';
    } else if (!url) {
      reason = 'Missing DIRECTUS_URL';
    }
  }

  // Fetch live title for hard proof (digital-health slug)
  const liveTitle = source === 'DIRECTUS' ? await fetchLiveTitle('digital-health') : null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      <div
        className={`rounded-lg px-3 py-1.5 text-xs font-mono font-semibold shadow-lg ${
          source === 'DIRECTUS'
            ? 'bg-green-600 text-white'
            : 'bg-yellow-600 text-white'
        }`}
        title={reason ? `Reason: ${reason}` : undefined}
      >
        CMS: {source}
        {reason && reason !== 'public' && (
          <span className="ml-1 opacity-75">({reason})</span>
        )}
      </div>
      {liveTitle && (
        <div className="rounded-lg px-3 py-1.5 text-xs font-mono bg-gray-900 text-white shadow-lg">
          digital-health: {liveTitle}
        </div>
      )}
    </div>
  );
}
