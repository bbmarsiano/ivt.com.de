/**
 * Validate Resource Access Token
 * 
 * GET /api/resources/validate?token=...
 * 
 * Lightweight endpoint to check token status without downloading the file.
 * Returns status and minimal metadata.
 */

import { NextRequest, NextResponse } from 'next/server';
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
      { ok: false, status: 'invalid' },
      { status: 400 }
    );
  }

  // Hash the incoming token
  const tokenHash = createHash('sha256').update(token).digest('hex');

  try {
    // Find token record
    const tokenResult = await prisma.$queryRaw<Array<{
      id: string;
      file_id: string | null;
      resource_key: string;
      expires_at: Date;
      revoked_at: Date | null;
      use_count: number;
    }>>(
      Prisma.sql`
        SELECT id, file_id, resource_key, expires_at, revoked_at, use_count
        FROM public.resource_access_tokens
        WHERE token_hash = ${tokenHash}
      `
    );

    if (tokenResult.length === 0 || !tokenResult[0]) {
      return NextResponse.json(
        { ok: false, status: 'invalid' },
        { status: 200 } // Return 200 to avoid leaking token existence
      );
    }

    const tokenRecord = tokenResult[0];
    const now = new Date();

    // Check if token is revoked
    if (tokenRecord.revoked_at && new Date(tokenRecord.revoked_at) <= now) {
      return NextResponse.json({
        ok: false,
        status: 'revoked',
      });
    }

    // Check if token is expired
    if (new Date(tokenRecord.expires_at) < now) {
      return NextResponse.json({
        ok: false,
        status: 'expired',
      });
    }

    // Token is valid - get filename if available
    let filename: string | null = null;
    if (tokenRecord.file_id) {
      try {
        const { getDirectusUrl, getDirectusToken } = await import('@/lib/env.directus');
        const directusUrl = getDirectusUrl();
        const directusToken = getDirectusToken();

        if (directusUrl) {
          const fileMetaEndpoint = `${directusUrl}/files/${tokenRecord.file_id}`;
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
        }
      } catch (error) {
        // Ignore filename fetch errors - filename is optional
        console.warn('[IVT][RESOURCES] Failed to fetch filename for validation:', error);
      }
    }

    return NextResponse.json({
      ok: true,
      status: 'valid',
      resourceKey: tokenRecord.resource_key,
      expiresAt: tokenRecord.expires_at.toISOString(),
      filename: filename || undefined,
    });
  } catch (error) {
    console.error('[IVT][RESOURCES] validate error:', error);
    return NextResponse.json(
      { ok: false, status: 'error' },
      { status: 500 }
    );
  }
}
