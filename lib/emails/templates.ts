/**
 * Email templates for application flow
 */

import { getSiteUrl } from '@/lib/env';

/**
 * Generate confirmation email content for applicant
 * @param originalTo - Original intended recipient (for testing mode display)
 */
export function getConfirmationEmailContent(
  token: string,
  projectSlug: string,
  companyName: string,
  originalTo?: string
): { subject: string; html: string; text: string } {
  const confirmUrl = `${getSiteUrl()}/apply/confirm?token=${token}`;

  const subject = 'Confirm your application – Innovation Valley Thüringen';

  // Add testing mode notice if original recipient differs
  const testingNotice = originalTo
    ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
         <p style="margin: 0; font-size: 13px; color: #92400e;">
           <strong>🧪 Testing Mode:</strong> Intended recipient: ${originalTo}
         </p>
       </div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testingNotice}
        <h1 style="color: #2563eb;">Confirm Your Application</h1>
        <p>Hello ${companyName},</p>
        <p>Thank you for your interest in the project: <strong>${projectSlug}</strong>.</p>
        <p>Please confirm your application by clicking the link below:</p>
        <p style="margin: 30px 0;">
          <a href="${confirmUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Confirm Application
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px;">${confirmUrl}</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">
          This link will expire in 48 hours. If you did not submit this application, please ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Innovation Valley Thüringen<br>
          This is an automated message. Please do not reply to this email.
        </p>
      </body>
    </html>
  `;

  const textPrefix = originalTo
    ? `🧪 Testing Mode: Intended recipient: ${originalTo}\n\n`
    : '';

  const text = `${textPrefix}Confirm Your Application

Hello ${companyName},

Thank you for your interest in the project: ${projectSlug}.

Please confirm your application by clicking the link below:

${confirmUrl}

This link will expire in 48 hours. If you did not submit this application, please ignore this email.

---
Innovation Valley Thüringen
This is an automated message. Please do not reply to this email.
  `.trim();

  return { subject, html, text };
}

/**
 * Generate forward email content for coordinator
 * @param originalTo - Original intended recipient (for testing mode display)
 */
export function getCoordinatorEmailContent(
  application: {
    projectSlug: string;
    companyName: string;
    companyEmail: string;
    companyWebsite: string;
    contactPerson: string;
    contactDetails: string;
    message: string;
  },
  originalTo?: string
): { subject: string; html: string; text: string } {
  const subject = `New confirmed project application: ${application.projectSlug}`;

  // Add testing mode notice if original recipient differs
  const testingNotice = originalTo
    ? `<div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin-bottom: 20px; border-radius: 4px;">
         <p style="margin: 0; font-size: 13px; color: #92400e;">
           <strong>🧪 Testing Mode:</strong> Intended recipient: ${originalTo}
         </p>
       </div>`
    : '';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        ${testingNotice}
        <h1 style="color: #2563eb;">New Project Application</h1>
        <p>A new application has been confirmed for the project: <strong>${application.projectSlug}</strong></p>
        
        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1f2937;">Company Information</h2>
          <p><strong>Company Name:</strong> ${application.companyName}</p>
          <p><strong>Email:</strong> <a href="mailto:${application.companyEmail}">${application.companyEmail}</a></p>
          <p><strong>Website:</strong> <a href="${application.companyWebsite}" target="_blank">${application.companyWebsite}</a></p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1f2937;">Contact Details</h2>
          <p><strong>Contact Person:</strong> ${application.contactPerson}</p>
          <p><strong>Contact Details:</strong> ${application.contactDetails}</p>
        </div>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0;">
          <h2 style="margin-top: 0; color: #1f2937;">Message</h2>
          <p style="white-space: pre-wrap;">${application.message}</p>
        </div>

        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="color: #666; font-size: 12px;">
          Innovation Valley Thüringen<br>
          This is an automated notification.
        </p>
      </body>
    </html>
  `;

  const textPrefix = originalTo
    ? `🧪 Testing Mode: Intended recipient: ${originalTo}\n\n`
    : '';

  const text = `${textPrefix}New Project Application

A new application has been confirmed for the project: ${application.projectSlug}

Company Information:
- Company Name: ${application.companyName}
- Email: ${application.companyEmail}
- Website: ${application.companyWebsite}

Contact Details:
- Contact Person: ${application.contactPerson}
- Contact Details: ${application.contactDetails}

Message:
${application.message}

---
Innovation Valley Thüringen
This is an automated notification.
  `.trim();

  return { subject, html, text };
}
