/**
 * Email sending utility using Resend
 * 
 * Provides sendMagicLinkEmail() for resource access links.
 * In development: falls back to logging if Resend API key not configured.
 * In production: throws error if Resend API key not configured.
 */

import { Resend } from 'resend';
import { getResendApiKey, getFromEmail, getAppBaseUrl } from '@/lib/env.server';

interface SendMagicLinkEmailParams {
  to: string;
  company: string;
  resourceTitle: string; // Resource title (e.g., "Project Report 2024")
  resourceKey: string;
  projectSlug: string | null;
  token: string; // Plaintext token (will be used to build URL)
  expiresAt: Date;
}

/**
 * Send magic link email for resource access
 * 
 * @param params Email parameters
 * @returns Promise<void> - resolves if sent successfully
 * @throws Error in production if RESEND_API_KEY is missing
 * @throws Error if email sending fails
 */
export async function sendMagicLinkEmail(
  params: SendMagicLinkEmailParams
): Promise<void> {
  const { to, company, resourceTitle, resourceKey, projectSlug, token, expiresAt } = params;

  // Build magic link URL from base URL and token
  const appBaseUrl = getAppBaseUrl();
  const magicLinkUrl = `${appBaseUrl}/resources/download?token=${token}`;

  // Get Resend configuration from environment
  let resendApiKey: string | undefined;
  try {
    resendApiKey = getResendApiKey();
  } catch (error) {
    // In development, allow missing API key (will log instead)
    if (process.env.NODE_ENV === 'development') {
      resendApiKey = undefined;
    } else {
      // In production, re-throw the error
      throw error;
    }
  }

  const emailFrom = getFromEmail();

  // Format expiry date
  const expiresAtStr = expiresAt.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  // Email content - subject uses resource title
  const subject = `Your download link: ${resourceTitle}`;
  
  // Plain text version
  const plainText = `
Hello,

You requested access to a resource${projectSlug ? ` from the "${projectSlug}" project` : ''}.

Resource: ${resourceTitle}
Company: ${company}

Click the link below to download:
${magicLinkUrl}

Valid for 24 hours. Works multiple times until it expires.

If you did not request this access, please ignore this email.

Best regards,
IVT Team
  `.trim();

  // HTML version with clean design
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #2563eb;">Your Download Link</h2>
  
  <p>Hello,</p>
  
  <p>You requested access to <strong>${resourceTitle}</strong>${projectSlug ? ` from the <strong>${projectSlug}</strong> project` : ''}.</p>
  
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Company:</strong> ${company}</p>
    <p style="margin: 5px 0;"><strong>Resource:</strong> ${resourceTitle}</p>
  </div>
  
  <p>Click the button below to download:</p>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="${magicLinkUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Resource</a>
  </div>
  
  <p style="font-size: 0.9em; color: #6b7280; text-align: center;">
    Valid for 24 hours. Works multiple times until it expires.
  </p>
  
  <p style="font-size: 0.85em; color: #9ca3af; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
    If you did not request this access, please ignore this email.
  </p>
  
  <p style="margin-top: 30px;">
    Best regards,<br>
    <strong>IVT Team</strong>
  </p>
  
  <p style="font-size: 0.75em; color: #9ca3af; margin-top: 20px;">
    Or copy this link: <a href="${magicLinkUrl}" style="color: #2563eb; word-break: break-all;">${magicLinkUrl}</a>
  </p>
</body>
</html>
  `.trim();

  // If Resend API key is not configured, log in development only
  if (!resendApiKey) {
    if (process.env.NODE_ENV === 'development') {
      // In development, log the email details (including magic link URL for testing)
      console.log(`[IVT][EMAIL] Resend API key not configured - logging email instead:`);
      console.log(`[IVT][EMAIL] To: ${to}`);
      console.log(`[IVT][EMAIL] Subject: ${subject}`);
      console.log(`[IVT][EMAIL] Magic Link URL: ${magicLinkUrl}`);
      console.log(`[IVT][EMAIL] Expires: ${expiresAtStr}`);
      // Return without throwing - caller will handle devMagicLinkUrl in response
      return;
    } else {
      // In production, this should never happen (getResendApiKey throws)
      throw new Error('Resend API key missing. Set RESEND_API_KEY environment variable.');
    }
  }

  // Initialize Resend client
  const resend = new Resend(resendApiKey);

  // Send email
  try {
    const { error, data } = await resend.emails.send({
      from: emailFrom,
      to,
      subject,
      html,
      text: plainText,
    });

    if (error) {
      console.error('[IVT][EMAIL] Resend API error:', error.name, error.message);
      throw new Error('Email service unavailable. Please try again later.');
    }

    if (!data) {
      throw new Error('Email service unavailable. Please try again later.');
    }

    // Log success (without sensitive data)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[IVT][EMAIL] Magic link email sent to ${to}:`, {
        messageId: data.id || 'unknown',
        resourceKey,
        projectSlug,
      });
    }
  } catch (error) {
    // Re-throw with safe message if not already our error
    if (error instanceof Error && error.message.includes('Email service unavailable')) {
      throw error;
    }
    // Log internal error but throw safe message
    console.error('[IVT][EMAIL] Failed to send magic link email:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Email service unavailable. Please try again later.');
  }
}
