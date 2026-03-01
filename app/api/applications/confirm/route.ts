import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { sendCoordinatorEmail } from '@/lib/emails/resend';

/**
 * POST /api/applications/confirm
 * Confirm an application and forward to coordinator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Confirmation token is required' },
        { status: 400 }
      );
    }

    // Find application by token
    const application = await prisma.projectApplication.findUnique({
      where: { confirmationToken: token },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Invalid or expired confirmation token' },
        { status: 404 }
      );
    }

    // Check if already confirmed
    if (application.status === 'confirmed' || application.status === 'forwarded') {
      return NextResponse.json(
        { error: 'Application has already been confirmed' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > application.confirmationExpiresAt) {
      return NextResponse.json(
        { error: 'Confirmation token has expired' },
        { status: 400 }
      );
    }

    // Update status to confirmed FIRST
    await prisma.projectApplication.update({
      where: { id: application.id },
      data: {
        status: 'confirmed',
        confirmedAt: new Date(),
      },
    });

    // Then attempt to send email to coordinator
    // If email fails, status remains 'confirmed' (not 'forwarded')
    try {
      await sendCoordinatorEmail(application.coordinatorEmail, {
        projectSlug: application.projectSlug,
        companyName: application.companyName,
        companyEmail: application.companyEmail,
        companyWebsite: application.companyWebsite,
        contactPerson: application.contactPerson,
        contactDetails: application.contactDetails,
        message: application.message,
      });

      // Update status to forwarded only after email succeeds
      await prisma.projectApplication.update({
        where: { id: application.id },
        data: {
          status: 'forwarded',
          forwardedAt: new Date(),
        },
      });
    } catch (emailError) {
      // Log error but application is still confirmed
      console.error('Failed to send coordinator email (application confirmed):', emailError instanceof Error ? emailError.message : 'Unknown error');
      // Return error but application is confirmed - can be re-forwarded later
      return NextResponse.json(
        {
          error: 'Application confirmed, but email service unavailable. The coordinator will be notified later.',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Application confirmed successfully',
    });
  } catch (error) {
    console.error('Error confirming application:', error);
    return NextResponse.json(
      {
        error: 'An error occurred while confirming your application',
      },
      { status: 500 }
    );
  }
}
