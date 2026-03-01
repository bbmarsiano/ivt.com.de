/**
 * Resend email sending utilities
 * Uses plain HTML/text strings - no React email components
 */

import { Resend } from 'resend';
import {
  getResendApiKey,
  getFromEmail,
  getResendTestToEmail,
} from '@/lib/env.server';
import {
  getConfirmationEmailContent,
  getCoordinatorEmailContent,
} from './templates';

let resendInstance: Resend | null = null;

/**
 * Get or create Resend instance
 */
function getResend(): Resend {
  if (!resendInstance) {
    const apiKey = getResendApiKey();
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

/**
 * Resolve the actual recipient email address
 * If RESEND_TEST_TO_EMAIL is set, use it instead of the intended recipient
 * @param intendedTo - The intended recipient email
 * @returns The actual recipient email (test override or intended)
 */
function resolveRecipient(intendedTo: string): string {
  const testEmail = getResendTestToEmail();
  if (testEmail) {
    console.log(`[Resend Testing Mode] Overriding recipient: ${intendedTo} -> ${testEmail}`);
    return testEmail;
  }
  return intendedTo;
}

/**
 * Check if error is Resend testing restriction error
 */
function isTestingRestrictionError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = String(error.message).toLowerCase();
    return (
      message.includes('testing emails') ||
      message.includes('only send testing emails') ||
      message.includes('your own email address')
    );
  }
  return false;
}

/**
 * Send confirmation email to applicant
 * @throws Error with safe message (no PII) if sending fails
 */
export async function sendConfirmationEmail(
  to: string,
  token: string,
  projectSlug: string,
  companyName: string
): Promise<void> {
  const originalTo = to;
  const actualTo = resolveRecipient(to);
  const isTestMode = actualTo !== originalTo;

  try {
    const resend = getResend();
    const fromEmail = getFromEmail();
    const { subject, html, text } = getConfirmationEmailContent(
      token,
      projectSlug,
      companyName,
      isTestMode ? originalTo : undefined
    );

    // Use plain HTML/text strings - Resend will not try to render React components
    const { error, data } = await resend.emails.send({
      from: fromEmail,
      to: actualTo,
      subject,
      html: html.trim(), // Ensure plain string
      text: text.trim(), // Ensure plain string
    });

    if (error) {
      // Check if it's a testing restriction error and retry with test email
      if (isTestingRestrictionError(error) && !isTestMode) {
        const testEmail = getResendTestToEmail();
        if (testEmail) {
          console.log(`[Resend Testing Mode] Retrying with test email: ${testEmail}`);
          // Retry with test email
          const { subject: retrySubject, html: retryHtml, text: retryText } =
            getConfirmationEmailContent(token, projectSlug, companyName, originalTo);
          const retryResult = await resend.emails.send({
            from: fromEmail,
            to: testEmail,
            subject: retrySubject,
            html: retryHtml.trim(),
            text: retryText.trim(),
          });

          if (retryResult.error) {
            console.error('Resend API error (retry):', retryResult.error.name, retryResult.error.message);
            throw new Error('Email service unavailable. Please try again later.');
          }

          if (!retryResult.data) {
            throw new Error('Email service unavailable. Please try again later.');
          }

          return; // Success with test email
        }
      }

      // Log error without PII
      console.error('Resend API error:', error.name, error.message);
      throw new Error('Email service unavailable. Please try again later.');
    }

    if (!data) {
      throw new Error('Email service unavailable. Please try again later.');
    }
  } catch (error) {
    // Re-throw with safe message if not already our error
    if (error instanceof Error && error.message.includes('Email service unavailable')) {
      throw error;
    }
    // Log internal error but throw safe message
    console.error('Failed to send confirmation email:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Email service unavailable. Please try again later.');
  }
}

/**
 * Send forward email to coordinator
 * @throws Error with safe message (no PII) if sending fails
 */
export async function sendCoordinatorEmail(
  to: string,
  application: {
    projectSlug: string;
    companyName: string;
    companyEmail: string;
    companyWebsite: string;
    contactPerson: string;
    contactDetails: string;
    message: string;
  }
): Promise<void> {
  const originalTo = to;
  const actualTo = resolveRecipient(to);
  const isTestMode = actualTo !== originalTo;

  try {
    const resend = getResend();
    const fromEmail = getFromEmail();
    const { subject, html, text } = getCoordinatorEmailContent(
      application,
      isTestMode ? originalTo : undefined
    );

    // Use plain HTML/text strings - Resend will not try to render React components
    const { error, data } = await resend.emails.send({
      from: fromEmail,
      to: actualTo,
      subject,
      html: html.trim(), // Ensure plain string
      text: text.trim(), // Ensure plain string
    });

    if (error) {
      // Check if it's a testing restriction error and retry with test email
      if (isTestingRestrictionError(error) && !isTestMode) {
        const testEmail = getResendTestToEmail();
        if (testEmail) {
          console.log(`[Resend Testing Mode] Retrying with test email: ${testEmail}`);
          // Retry with test email
          const { subject: retrySubject, html: retryHtml, text: retryText } =
            getCoordinatorEmailContent(application, originalTo);
          const retryResult = await resend.emails.send({
            from: fromEmail,
            to: testEmail,
            subject: retrySubject,
            html: retryHtml.trim(),
            text: retryText.trim(),
          });

          if (retryResult.error) {
            console.error('Resend API error (retry):', retryResult.error.name, retryResult.error.message);
            throw new Error('Email service unavailable. Please try again later.');
          }

          if (!retryResult.data) {
            throw new Error('Email service unavailable. Please try again later.');
          }

          return; // Success with test email
        }
      }

      // Log error without PII
      console.error('Resend API error:', error.name, error.message);
      throw new Error('Email service unavailable. Please try again later.');
    }

    if (!data) {
      throw new Error('Email service unavailable. Please try again later.');
    }
  } catch (error) {
    // Re-throw with safe message if not already our error
    if (error instanceof Error && error.message.includes('Email service unavailable')) {
      throw error;
    }
    // Log internal error but throw safe message
    console.error('Failed to send coordinator email:', error instanceof Error ? error.message : 'Unknown error');
    throw new Error('Email service unavailable. Please try again later.');
  }
}
