import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey } from '@/lib/env.server';
import { prisma } from '@/lib/db/prisma';
import { sendConfirmationEmail } from '@/lib/emails/resend';
import { randomUUID } from 'crypto';

/**
 * POST /api/admin/applications/[id]/resend-confirmation
 * Resend confirmation email for an application
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

    if (application.status !== 'pending_confirmation') {
      return NextResponse.json(
        { error: 'Application is not pending confirmation' },
        { status: 400 }
      );
    }

    // Generate new confirmation token and expiry
    const newToken = randomUUID();
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 48); // 48 hours

    // Update application with new token
    await prisma.projectApplication.update({
      where: { id },
      data: {
        confirmationToken: newToken,
        confirmationExpiresAt: newExpiry,
      },
    });

    // Send confirmation email
    try {
      await sendConfirmationEmail(
        application.companyEmail,
        newToken,
        application.projectSlug,
        application.companyName
      );
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send confirmation email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent successfully',
    });
  } catch (error) {
    console.error('Error resending confirmation email:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}
