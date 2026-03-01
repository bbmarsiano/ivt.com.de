/**
 * Resend Access Token for Expired Link
 * 
 * POST /api/resources/resend-access
 * 
 * Generates a new token for an expired access request.
 * Rate limited: 3 requests/hour per request_id, 10/hour per IP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RequestBody {
  token: string;
}

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const parts = forwarded.split(',');
    return parts[0]?.trim() || 'unknown';
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: RequestBody = await request.json();

    if (!body.token) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_TOKEN', message: 'Token is required' } },
        { status: 400 }
      );
    }

    // Hash the incoming token
    const tokenHash = createHash('sha256').update(body.token).digest('hex');

    // Rate limiting: 10 requests/hour per IP
    const ip = getClientIp(request);
    const ipRateLimitKey = `ip:${ip}`;
    if (!checkRateLimit(ipRateLimitKey, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' } },
        { status: 429 }
      );
    }

    // Find token record (even if expired)
    const tokenResult = await prisma.$queryRaw<Array<{
      id: string;
      request_id: string;
      resource_key: string;
      project_slug: string | null;
      expires_at: Date;
      revoked_at: Date | null;
    }>>(
      Prisma.sql`
        SELECT id, request_id, resource_key, project_slug, expires_at, revoked_at
        FROM public.resource_access_tokens
        WHERE token_hash = ${tokenHash}
      `
    );

    if (tokenResult.length === 0 || !tokenResult[0]) {
      // Don't reveal if token exists - return generic error
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_TOKEN', message: 'Invalid token' } },
        { status: 404 }
      );
    }

    const tokenRecord = tokenResult[0];

    // Rate limiting: 3 requests/hour per request_id
    const requestRateLimitKey = `request:${tokenRecord.request_id}`;
    if (!checkRateLimit(requestRateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' } },
        { status: 429 }
      );
    }

    // Get request details
    const requestResult = await prisma.$queryRaw<Array<{
      id: string;
      email: string;
      company: string;
      resource_key: string;
      project_slug: string | null;
    }>>(
      Prisma.sql`
        SELECT id, email, company, resource_key, project_slug
        FROM public.resource_access_requests
        WHERE id = CAST(${tokenRecord.request_id} AS uuid)
      `
    );

    if (requestResult.length === 0 || !requestResult[0]) {
      return NextResponse.json(
        { ok: false, error: { code: 'REQUEST_NOT_FOUND', message: 'Request not found' } },
        { status: 404 }
      );
    }

    const requestRecord = requestResult[0];

    // Fetch resource title from Directus for email
    const { getDirectusUrl, getDirectusToken } = await import('@/lib/env.directus');
    const directusUrl = getDirectusUrl();
    const directusToken = getDirectusToken();
    let resourceTitle = requestRecord.resource_key; // Fallback to key if fetch fails

    if (directusUrl) {
      try {
        const resourceEndpoint = `${directusUrl}/items/resources?filter[key][_eq]=${encodeURIComponent(requestRecord.resource_key)}&fields=title_en,title_de,key`;
        const resourceResponse = await fetch(resourceEndpoint, {
          cache: 'no-store',
          headers: directusToken
            ? {
                Authorization: `Bearer ${directusToken}`,
                'Content-Type': 'application/json',
              }
            : {
                'Content-Type': 'application/json',
              },
        });

        if (resourceResponse.ok) {
          const resourceData = await resourceResponse.json();
          const resources = resourceData.data || [];
          if (resources.length > 0) {
            const resource = resources[0];
            resourceTitle = resource.title_en || resource.title_de || resource.key || requestRecord.resource_key;
          }
        }
      } catch (error) {
        // Silently fallback to resource_key if fetch fails
        console.error('[IVT][RESOURCES] Failed to fetch resource title for resend:', error);
      }
    }

    // Revoke old token (optional cleanup)
    await prisma.$executeRaw(
      Prisma.sql`
        UPDATE public.resource_access_tokens
        SET revoked_at = NOW()
        WHERE id = CAST(${tokenRecord.id} AS uuid)
      `
    );

    // Generate new secure token (32 bytes = 256 bits)
    const newToken = randomBytes(32).toString('hex');
    const newTokenHash = createHash('sha256').update(newToken).digest('hex');

    // New token expires in 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Get file_id from old token or fetch from resource
    const oldTokenFileResult = await prisma.$queryRaw<Array<{ file_id: string | null }>>(
      Prisma.sql`
        SELECT file_id
        FROM public.resource_access_tokens
        WHERE id = CAST(${tokenRecord.id} AS uuid)
      `
    );
    const fileId = oldTokenFileResult[0]?.file_id || null;

    // Create new token record (link to same request_id)
    // Handle NULL file_id properly
    if (fileId) {
      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO public.resource_access_tokens 
          (request_id, token_hash, resource_key, project_id, project_slug, file_id, expires_at, created_at)
          VALUES (CAST(${tokenRecord.request_id} AS uuid), ${newTokenHash}, ${requestRecord.resource_key}, NULL, ${requestRecord.project_slug}, CAST(${fileId} AS uuid), ${expiresAt}, NOW())
        `
      );
    } else {
      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO public.resource_access_tokens 
          (request_id, token_hash, resource_key, project_id, project_slug, file_id, expires_at, created_at)
          VALUES (CAST(${tokenRecord.request_id} AS uuid), ${newTokenHash}, ${requestRecord.resource_key}, NULL, ${requestRecord.project_slug}, NULL, ${expiresAt}, NOW())
        `
      );
    }

    // Build magic link URL (will be built inside sendMagicLinkEmail, but we need it for dev logging)
    const { getAppBaseUrl } = await import('@/lib/env.server');
    const appBaseUrl = getAppBaseUrl();
    const magicLinkUrl = `${appBaseUrl}/resources/download?token=${newToken}`;

    // Send email with new download link
    let emailSent = false;
    try {
      const { sendMagicLinkEmail } = await import('@/lib/email/sendEmail');
      await sendMagicLinkEmail({
        to: requestRecord.email,
        company: requestRecord.company,
        resourceTitle,
        resourceKey: requestRecord.resource_key,
        projectSlug: requestRecord.project_slug,
        token: newToken, // Pass token, not URL
        expiresAt,
      });
      emailSent = true;
    } catch (error) {
      // In production, email sending is required - return error
      if (process.env.NODE_ENV === 'production') {
        const errorMessage = error instanceof Error ? error.message : 'Email service unavailable';
        console.error('[IVT][RESOURCES] Failed to send resend email in production:', errorMessage);
        return NextResponse.json(
          { ok: false, error: { code: 'EMAIL_SEND_FAILED', message: errorMessage } },
          { status: 500 }
        );
      }
      // In development, log but continue (will return devMagicLinkUrl)
      console.error('[IVT][RESOURCES] Failed to send resend email (dev mode, continuing):', error instanceof Error ? error.message : 'Unknown error');
    }

    // Dev-only: Log magic link URL for testing (only if email wasn't sent)
    if (process.env.NODE_ENV === 'development') {
      if (!emailSent) {
        console.log(`[IVT][RESOURCES] magic-link url=${magicLinkUrl} exp=${expiresAt.toISOString()} email=${requestRecord.email} resourceKey=${requestRecord.resource_key} projectSlug=${requestRecord.project_slug || 'null'}`);
      }
    }

    // Return response (include devMagicLinkUrl in dev mode only)
    const response: { ok: true; devMagicLinkUrl?: string } = { ok: true };
    if (process.env.NODE_ENV === 'development') {
      response.devMagicLinkUrl = magicLinkUrl;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('[IVT][RESOURCES] resend-access error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    );
  }
}
