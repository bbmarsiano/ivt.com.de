import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/env.server';
import { prisma } from '@/lib/db/prisma';
import { sendCoordinatorEmail } from '@/lib/emails/resend';

/**
 * POST /api/admin/applications/[id]/resend-forward
 * Resend forward email to coordinator for a confirmed application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const adminKey = searchParams.get('key');

    // Validate admin key
    if (!validateAdminKey(adminKey)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find application
    const application = await prisma.projectApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Application is not confirmed' },
        { status: 400 }
      );
    }

    // Send coordinator email
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

      // Update status to forwarded
      await prisma.projectApplication.update({
        where: { id },
        data: {
          status: 'forwarded',
          forwardedAt: new Date(),
        },
      });
    } catch (emailError) {
      console.error('Failed to send coordinator email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send coordinator email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Forward email sent successfully',
    });
  } catch (error) {
    console.error('Error resending forward email:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
