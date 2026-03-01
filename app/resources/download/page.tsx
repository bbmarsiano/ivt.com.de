/**
 * Magic Link Download Landing Page
 * 
 * GET /resources/download?token=...
 * 
 * User-friendly landing page for download links sent via email.
 * Validates token first, then triggers normal browser download (no infinite spinner).
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { Loader2, AlertCircle, RefreshCw, Mail, Lock, Download, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type TokenStatus = 'validating' | 'valid' | 'downloading' | 'started' | 'expired' | 'invalid' | 'revoked' | 'rate-limited' | 'error';

interface ValidationResponse {
  ok: boolean;
  status: 'valid' | 'expired' | 'revoked' | 'invalid' | 'error';
  resourceKey?: string;
  expiresAt?: string;
  filename?: string;
}

export default function ResourceDownloadPage() {
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const [status, setStatus] = useState<TokenStatus>('validating');
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const downloadTriggeredRef = useRef(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    // Validate token first
    validateToken();
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setStatus('invalid');
      return;
    }

    try {
      const response = await fetch(`/api/resources/validate?token=${encodeURIComponent(token)}`, {
        method: 'GET',
        cache: 'no-store',
      });

      const data: ValidationResponse = await response.json();

      if (data.ok && data.status === 'valid') {
        // Token is valid - set download URL and trigger download
        const downloadApiUrl = `/api/resources/download?token=${encodeURIComponent(token)}`;
        setDownloadUrl(downloadApiUrl);

        // Auto-trigger download using normal link navigation (not fetch)
        // This prevents infinite spinner because browser handles download
        if (!downloadTriggeredRef.current) {
          downloadTriggeredRef.current = true;
          // Set status to 'downloading' before triggering
          setStatus('downloading');
          // Small delay to ensure UI updates, then trigger download
          setTimeout(() => {
            try {
              window.location.href = downloadApiUrl;
              // Immediately transition to "started" state after triggering
              setStatus('started');
            } catch (error) {
              // If download trigger fails, show error
              console.error('[IVT][RESOURCES] Failed to trigger download:', error);
              setStatus('error');
              setErrorMessage(error instanceof Error ? error.message : 'Failed to start download');
            }
          }, 100);
        }
      } else if (data.status === 'expired') {
        setStatus('expired');
      } else if (data.status === 'revoked') {
        setStatus('revoked');
      } else if (data.status === 'invalid') {
        setStatus('invalid');
      } else {
        setStatus('error');
        setErrorMessage(data.status || 'Unknown error');
      }
    } catch (error) {
      console.error('[IVT][RESOURCES] Download page validation error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleResend = async () => {
    if (!token) return;

    setIsResending(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/resources/resend-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setStatus('rate-limited');
        } else {
          setErrorMessage(
            data.error ||
            (language === 'de'
              ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
              : 'An error occurred. Please try again later.')
          );
        }
        setIsResending(false);
        return;
      }

      setIsResending(false);
      setResendSuccess(true);
    } catch (error) {
      console.error('[IVT][RESOURCES] Resend error:', error);
      setErrorMessage(
        language === 'de'
          ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
          : 'An error occurred. Please try again later.'
      );
      setIsResending(false);
    }
  };

  const handleManualDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
    }
  };

  // Validating state
  if (status === 'validating') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              {language === 'de' ? 'Wird überprüft...' : 'Validating...'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'de'
                ? 'Bitte warten Sie, während wir Ihren Link überprüfen.'
                : 'Please wait while we validate your link.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Downloading state - download is being triggered
  if (status === 'downloading' || status === 'valid') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                {language === 'de' ? 'Download wird gestartet...' : 'Your download is starting…'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'de'
                  ? 'Wenn der Download nicht automatisch startet, klicken Sie auf die Schaltfläche unten.'
                  : 'If it doesn\'t start automatically, click the button below.'}
              </p>
              {downloadUrl && (
                <Button onClick={handleManualDownload} size="lg" className="w-full mb-4">
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'de' ? 'Datei herunterladen' : 'Download file'}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {language === 'de'
                  ? 'Dieser Link funktioniert mehrmals, bis er abläuft.'
                  : 'This link works multiple times until it expires.'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Started state - download has been triggered
  if (status === 'started') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-2">
                {language === 'de' ? 'Download gestartet' : 'Download started'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'de'
                  ? 'Wenn Sie es erneut benötigen, verwenden Sie die Schaltfläche unten.'
                  : 'If you need it again, use the button below.'}
              </p>
              {downloadUrl && (
                <Button onClick={handleManualDownload} size="lg" className="w-full mb-4">
                  <Download className="mr-2 h-4 w-4" />
                  {language === 'de' ? 'Datei erneut herunterladen' : 'Download again'}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {language === 'de'
                  ? 'Dieser Link funktioniert mehrmals, bis er abläuft.'
                  : 'This link works multiple times until it expires.'}
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error states
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/10 p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            {status === 'expired' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-orange-100 p-3">
                    <AlertCircle className="h-12 w-12 text-orange-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {language === 'de' ? 'Link abgelaufen' : 'Link Expired'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'de'
                    ? 'Dieser Download-Link ist abgelaufen. Bitte fordern Sie einen neuen Link an.'
                    : 'This download link has expired. Please request a new link.'}
                </p>
                {resendSuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Mail className="h-5 w-5" />
                      <p className="font-medium">
                        {language === 'de'
                          ? 'Ein neuer Link wurde an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach.'
                          : 'A new link has been sent to your email. Check your inbox.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleResend} disabled={isResending} size="lg" className="w-full">
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === 'de' ? 'Wird gesendet...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {language === 'de' ? 'Link erneut senden' : 'Resend link'}
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

            {status === 'invalid' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <Lock className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {language === 'de' ? 'Ungültiger Link' : 'Invalid Link'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'de'
                    ? 'Dieser Download-Link ist ungültig. Bitte kontaktieren Sie uns, wenn Sie Hilfe benötigen.'
                    : 'This download link is invalid. Please contact us if you need assistance.'}
                </p>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/contact">
                    {language === 'de' ? 'Kontakt' : 'Contact Us'}
                  </Link>
                </Button>
              </>
            )}

            {status === 'revoked' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <Lock className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {language === 'de' ? 'Link widerrufen' : 'Link Revoked'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'de'
                    ? 'Dieser Download-Link wurde widerrufen. Bitte fordern Sie einen neuen Link an.'
                    : 'This download link has been revoked. Please request a new link.'}
                </p>
                {resendSuccess ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4">
                    <div className="flex items-center justify-center gap-2 text-green-700">
                      <Mail className="h-5 w-5" />
                      <p className="font-medium">
                        {language === 'de'
                          ? 'Ein neuer Link wurde an Ihre E-Mail gesendet. Bitte überprüfen Sie Ihr Postfach.'
                          : 'A new link has been sent to your email. Check your inbox.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleResend} disabled={isResending} size="lg" className="w-full">
                    {isResending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === 'de' ? 'Wird gesendet...' : 'Sending...'}
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        {language === 'de' ? 'Link erneut senden' : 'Resend link'}
                      </>
                    )}
                  </Button>
                )}
              </>
            )}

            {status === 'rate-limited' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-yellow-100 p-3">
                    <AlertCircle className="h-12 w-12 text-yellow-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {language === 'de' ? 'Zu viele Anfragen' : 'Too Many Requests'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {language === 'de'
                    ? 'Bitte warten Sie einen Moment und versuchen Sie es später erneut.'
                    : 'Please wait a moment and try again later.'}
                </p>
                <Button onClick={() => window.location.href = '/'} variant="outline" size="lg" className="w-full">
                  {language === 'de' ? 'Zur Startseite' : 'Go to Homepage'}
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <AlertCircle className="h-12 w-12 text-red-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-2">
                  {language === 'de' ? 'Fehler' : 'Error'}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {errorMessage ||
                    (language === 'de'
                      ? 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.'
                      : 'An error occurred. Please try again later.')}
                </p>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/contact">
                    {language === 'de' ? 'Kontakt' : 'Contact Us'}
                  </Link>
                </Button>
              </>
            )}
          </motion.div>
        </CardContent>
      </Card>
    </div>
  );
}
