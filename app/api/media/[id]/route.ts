/**
 * Media Proxy Route
 * 
 * Proxies Directus media assets to the browser with server-side authentication.
 * Directus assets require Authorization header, which browsers cannot provide.
 * This route fetches the asset server-side and streams it to the client.
 * 
 * GET /api/media/:id
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDirectusUrl, getDirectusToken } from '@/lib/env.directus';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json(
      { error: 'Invalid file ID format' },
      { status: 400 }
    );
  }

  const directusUrl = getDirectusUrl();
  const directusToken = getDirectusToken();

  if (!directusUrl) {
    return NextResponse.json(
      { error: 'Directus URL not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch asset from Directus with server-side token
    const assetUrl = `${directusUrl}/assets/${id}`;
    const headers: Record<string, string> = {
      'Accept': '*/*',
    };

    if (directusToken) {
      headers['Authorization'] = `Bearer ${directusToken}`;
    }

    const response = await fetch(assetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });

    // Forward non-OK status codes
    if (!response.ok) {
      return NextResponse.json(
        { error: `Directus asset fetch failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get content type from Directus response, fallback to octet-stream
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Get the binary body
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return the binary response with appropriate headers
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': process.env.NODE_ENV === 'development' ? 'no-store' : 'public, max-age=31536000, immutable',
        // Pass through other useful headers if present
        ...(response.headers.get('content-length') && {
          'Content-Length': response.headers.get('content-length')!,
        }),
      },
    });
  } catch (error) {
    console.error(`[IVT][Media] Proxy error for ${id}:`, error);
    return NextResponse.json(
      { error: `Media proxy error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
