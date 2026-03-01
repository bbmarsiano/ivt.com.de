/**
 * Request Access to Gated Resource
 * 
 * POST /api/resources/request-access
 * 
 * Creates an access request and generates a magic-link download token.
 * Rate limited: 3 requests/hour per (email + resourceKey + projectSlug), 10/hour per IP.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDirectusUrl, getDirectusToken } from '@/lib/env.directus';
import { createHash, randomBytes } from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface RequestBody {
  email: string;
  company: string;
  resourceKey: string;
  projectSlug: string;
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

    // Validate input
    if (!body.email || !body.company || !body.resourceKey || !body.projectSlug) {
      return NextResponse.json(
        { ok: false, error: { code: 'MISSING_FIELDS', message: 'Missing required fields: email, company, resourceKey, projectSlug' } },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { ok: false, error: { code: 'INVALID_EMAIL', message: 'Invalid email format' } },
        { status: 400 }
      );
    }

    // Rate limiting: 3 requests/hour per (email + resourceKey + projectSlug)
    const userRateLimitKey = `user:${body.email}:${body.resourceKey}:${body.projectSlug}`;
    if (!checkRateLimit(userRateLimitKey, 3, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' } },
        { status: 429 }
      );
    }

    // Rate limiting: 10 requests/hour per IP
    const ip = getClientIp(request);
    const ipRateLimitKey = `ip:${ip}`;
    if (!checkRateLimit(ipRateLimitKey, 10, 60 * 60 * 1000)) {
      return NextResponse.json(
        { ok: false, error: { code: 'RATE_LIMITED', message: 'Rate limit exceeded. Please try again later.' } },
        { status: 429 }
      );
    }

    const directusUrl = getDirectusUrl();
    const directusToken = getDirectusToken();

    if (!directusUrl) {
      return NextResponse.json(
        { ok: false, error: { code: 'CONFIG_ERROR', message: 'Directus URL not configured' } },
        { status: 500 }
      );
    }

    // Fetch resource from Directus by key (include title for email)
    const resourceEndpoint = `${directusUrl}/items/resources?filter[key][_eq]=${encodeURIComponent(body.resourceKey)}&fields=id,key,title_en,title_de,file_id,external_url,gated,visible,categories.category_id.key`;
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

    if (!resourceResponse.ok) {
      return NextResponse.json(
        { ok: false, error: { code: 'RESOURCE_FETCH_FAILED', message: 'Failed to fetch resource' } },
        { status: 500 }
      );
    }

    const resourceData = await resourceResponse.json();
    const resources = resourceData.data || [];

    if (resources.length === 0) {
      return NextResponse.json(
        { ok: false, error: { code: 'RESOURCE_NOT_FOUND', message: 'Resource not found' } },
        { status: 404 }
      );
    }

    const resource = resources[0];
    // Get resource title (prefer English, fallback to German, then key)
    const resourceTitle = resource.title_en || resource.title_de || resource.key || body.resourceKey;

    // Check if resource is public
    const categories = resource.categories || [];
    const isPublic = Array.isArray(categories) && categories.some(
      (cat: any) => cat?.category_id?.key === 'public'
    );

    if (isPublic) {
      return NextResponse.json(
        { ok: false, error: { code: 'PUBLIC_RESOURCE', message: 'Public resources do not require access requests' } },
        { status: 400 }
      );
    }

    // Check if resource has file_id
    if (!resource.file_id) {
      return NextResponse.json(
        { ok: false, error: { code: 'NO_FILE', message: 'Resource has no file to download' } },
        { status: 400 }
      );
    }

    // Note: We skip project validation for now (project_id will be NULL)
    // project_slug is stored as TEXT for rate limiting and reference

    try {
      // Create access request record using Prisma.sql template
      // Store project_slug as TEXT, project_id as NULL
      const userAgent = request.headers.get('user-agent') || null;
      
      // Dev log: confirm which columns are being used
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][RESOURCES] request-access input:`, {
          email: body.email,
          resourceKey: body.resourceKey,
          projectSlug: body.projectSlug,
          dbColumns: { project_slug: 'TEXT (using)', project_id: 'UUID (NULL)' }
        });
      }
      
      // Insert into resource_access_requests and get UUID id from database
      const requestIdResult = await prisma.$queryRaw<Array<{ id: string }>>(
        Prisma.sql`
          INSERT INTO public.resource_access_requests (email, company, resource_key, project_id, project_slug, ip, user_agent, created_at)
          VALUES (${body.email}, ${body.company}, ${body.resourceKey}, NULL, ${body.projectSlug}, ${ip}, ${userAgent}, NOW())
          RETURNING id
        `
      );

      // Extract UUID from database result (must come from DB RETURNING id)
      if (!requestIdResult || requestIdResult.length === 0 || !requestIdResult[0]?.id) {
        throw new Error('Failed to get request ID from database');
      }

      const requestId = requestIdResult[0].id;

      // Dev log: confirm requestId came from DB RETURNING id
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][RESOURCES] request-access requestId from DB RETURNING id:`, {
          requestId,
          source: 'database RETURNING id',
          type: 'UUID (from DB)'
        });
      }

      // Generate secure token (32 bytes = 256 bits)
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');

      // Token expires in 24 hours
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create token record
      // Store project_slug as TEXT, project_id as NULL
      // requestId comes from DB RETURNING id (UUID), PostgreSQL should recognize it as UUID type
      // Use explicit CAST to ensure PostgreSQL treats requestId as UUID (not TEXT)
      await prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO public.resource_access_tokens 
          (request_id, token_hash, resource_key, project_id, project_slug, file_id, expires_at, created_at)
          VALUES (CAST(${requestId} AS uuid), ${tokenHash}, ${body.resourceKey}, NULL, ${body.projectSlug}, CAST(${resource.file_id} AS uuid), ${expiresAt}, NOW())
        `
      );

      // Dev log: confirm token created
      if (process.env.NODE_ENV === 'development') {
        console.log(`[IVT][RESOURCES] request-access token created ok:`, {
          requestId,
          tokenHash: tokenHash.substring(0, 16) + '...',
          expiresAt: expiresAt.toISOString()
        });
      }

      // Build magic link URL (will be built inside sendMagicLinkEmail, but we need it for dev logging)
      const { getAppBaseUrl } = await import('@/lib/env.server');
      const appBaseUrl = getAppBaseUrl();
      const magicLinkUrl = `${appBaseUrl}/resources/download?token=${token}`;

      // Send email with download link
      let emailSent = false;
      try {
        const { sendMagicLinkEmail } = await import('@/lib/email/sendEmail');
        await sendMagicLinkEmail({
          to: body.email,
          company: body.company,
          resourceTitle,
          resourceKey: body.resourceKey,
          projectSlug: body.projectSlug,
          token, // Pass token, not URL
          expiresAt,
        });
        emailSent = true;
      } catch (error) {
        // In production, email sending is required - return error
        if (process.env.NODE_ENV === 'production') {
          const errorMessage = error instanceof Error ? error.message : 'Email service unavailable';
          console.error('[IVT][RESOURCES] Failed to send email in production:', errorMessage);
          return NextResponse.json(
            { ok: false, error: { code: 'EMAIL_SEND_FAILED', message: errorMessage } },
            { status: 500 }
          );
        }
        // In development, log but continue (will return devMagicLinkUrl)
        console.error('[IVT][RESOURCES] Failed to send email (dev mode, continuing):', error instanceof Error ? error.message : 'Unknown error');
      }

      // Dev-only: Log magic link URL for testing (only if email wasn't sent)
      if (process.env.NODE_ENV === 'development') {
        if (!emailSent) {
          console.log(`[IVT][RESOURCES] magic-link url=${magicLinkUrl} exp=${expiresAt.toISOString()} email=${body.email} resourceKey=${body.resourceKey} projectSlug=${body.projectSlug || 'null'}`);
        }
      }

      // Return response (include devMagicLinkUrl in dev mode only)
      const response: { ok: true; devMagicLinkUrl?: string } = { ok: true };
      if (process.env.NODE_ENV === 'development') {
        response.devMagicLinkUrl = magicLinkUrl;
      }

      return NextResponse.json(response);
    } catch (error) {
      console.error('[IVT][RESOURCES] request-access error:', error);
      return NextResponse.json(
        { ok: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[IVT][RESOURCES] request-access outer error:', error);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Internal server error' } },
      { status: 500 }
    );
  }
}
