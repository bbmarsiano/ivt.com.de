import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { applicationSchema } from '@/lib/validators/application';
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit';
import { resolveCoordinatorEmail } from '@/lib/utils/coordinator';
import { sendConfirmationEmail } from '@/lib/emails/resend';
import { randomUUID } from 'crypto';

/**
 * POST /api/applications
 * Submit a new project application
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request.headers);
    if (checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse and validate request body
    const body = await request.json();

    // Honeypot check - if website2 is filled, silently reject
    if (body.website2 && body.website2.trim().length > 0) {
      // Return 200 OK to not reveal it's a honeypot
      return NextResponse.json({ success: true });
    }

    // Validate with Zod
    const validationResult = applicationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Resolve coordinator email (server-side only)
    let coordinatorEmail: string;
    try {
      coordinatorEmail = resolveCoordinatorEmail(data.projectSlug);
    } catch (error) {
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Failed to resolve coordinator email',
        },
        { status: 500 }
      );
    }

    // Generate confirmation token and expiry
    const confirmationToken = randomUUID();
    const confirmationExpiresAt = new Date();
    confirmationExpiresAt.setHours(confirmationExpiresAt.getHours() + 48); // 48 hours

    // Create application in database FIRST
    await prisma.projectApplication.create({
      data: {
        projectSlug: data.projectSlug,
        companyName: data.companyName,
        companyEmail: data.companyEmail,
        companyWebsite: data.companyWebsite,
        contactPerson: data.contactPerson,
        contactDetails: data.contactDetails,
        message: data.message,
        confirmationToken,
        confirmationExpiresAt,
        coordinatorEmail,
        status: 'pending_confirmation',
      },
    });

    // Then attempt to send confirmation email
    // If email fails, DB record is already saved (user can request resend later)
    // Testing mode (RESEND_TEST_TO_EMAIL) is handled automatically in sendConfirmationEmail
    try {
      await sendConfirmationEmail(
        data.companyEmail,
        confirmationToken,
        data.projectSlug,
        data.companyName
      );
      // Email sent successfully (either to original recipient or test override)
    } catch (emailError) {
      // Log error but don't fail the request - DB record is saved
      console.error('Failed to send confirmation email (application saved):', emailError instanceof Error ? emailError.message : 'Unknown error');
      // Return error response but application is already in DB
      return NextResponse.json(
        {
          error: 'Email service unavailable. Please try again later.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    return NextResponse.json(
      {
        error: 'An error occurred while submitting your application',
      },
      { status: 500 }
    );
  }
}
