/**
 * Download Gated Resource via Token
 * 
 * GET /api/resources/download?token=...
 * 
 * Validates token and streams the file to the client.
 * Token is multi-use until expiry (24 hours).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDirectusUrl, getDirectusToken } from '@/lib/env.directus';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { error: 'Token is required' },
      { status: 400 }
    );
  }

  // Hash the incoming token
  const tokenHash = createHash('sha256').update(token).digest('hex');

  try {
    // Find token record
    const tokenResult = await prisma.$queryRaw<Array<{
      id: string;
      request_id: string | null;
      file_id: string;
      expires_at: Date;
      revoked_at: Date | null;
      use_count: number;
      last_used_at: Date | null;
    }>>(
      Prisma.sql`
        SELECT id, request_id, file_id, expires_at, revoked_at, use_count, last_used_at
        FROM public.resource_access_tokens
        WHERE token_hash = ${tokenHash}
      `
    );

    if (tokenResult.length === 0 || !tokenResult[0]) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 404 }
      );
    }

    const tokenRecord = tokenResult[0];
    const now = new Date();

    // Dev log: confirm token found
    if (process.env.NODE_ENV === 'development') {
      console.log(`[IVT][RESOURCES] download token found:`, {
        token_id: tokenRecord.id,
        request_id: tokenRecord.request_id,
        use_count: tokenRecord.use_count
      });
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < now) {
      return NextResponse.json(
        { error: 'expired' },
        { status: 410 }
      );
    }

    // Check if token is revoked
    if (tokenRecord.revoked_at && new Date(tokenRecord.revoked_at) <= now) {
      return NextResponse.json(
        { error: 'expired' },
        { status: 410 }
      );
    }

    // Update use count and last used timestamp
    // Cast id to UUID to ensure PostgreSQL recognizes it as UUID type (not TEXT)
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE public.resource_access_tokens
        SET use_count = use_count + 1, last_used_at = NOW()
        WHERE id = CAST(${tokenRecord.id} AS uuid)
      `
    );

    const fileId = tokenRecord.file_id;

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID not found' },
        { status: 500 }
      );
    }

    // Fetch file from Directus
    const directusUrl = getDirectusUrl();
    const directusToken = getDirectusToken();

    if (!directusUrl) {
      return NextResponse.json(
        { error: 'Directus URL not configured' },
        { status: 500 }
      );
    }

    const assetUrl = `${directusUrl}/assets/${fileId}`;
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

    if (!response.ok) {
      return NextResponse.json(
        { error: `Directus asset fetch failed: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Get content type from Directus response
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Get filename from Directus file metadata if available
    let filename: string | null = null;
    try {
      const fileMetaEndpoint = `${directusUrl}/files/${fileId}`;
      const fileMetaResponse = await fetch(fileMetaEndpoint, {
        cache: 'no-store',
        headers: directusToken
          ? { Authorization: `Bearer ${directusToken}` }
          : {},
      });
      if (fileMetaResponse.ok) {
        const fileMeta = await fileMetaResponse.json();
        filename = fileMeta.data?.filename_download || fileMeta.data?.filename || null;
      }
    } catch (error) {
      // Ignore metadata fetch errors, continue with download
      console.warn('[IVT][RESOURCES] Failed to fetch file metadata:', error);
    }

    // Get the binary body
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Log successful download
    const newUseCount = (tokenRecord.use_count || 0) + 1;
    console.log(`[IVT][RESOURCES] download token ok use_count=${newUseCount} file_id=${fileId}`);

    // Return the binary response with download headers
    const responseHeaders: Record<string, string> = {
      'Content-Type': contentType,
      'Content-Disposition': filename
        ? `attachment; filename="${filename}"`
        : 'attachment',
      'Cache-Control': 'no-store',
    };

    if (response.headers.get('content-length')) {
      responseHeaders['Content-Length'] = response.headers.get('content-length')!;
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[IVT][RESOURCES] download error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
