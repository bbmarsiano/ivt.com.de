'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/i18n';

type ConfirmationState = 'loading' | 'success' | 'error' | 'invalid';

export default function ConfirmApplicationPage() {
  const { language } = useLanguage();
  const searchParams = useSearchParams();
  const [state, setState] = useState<ConfirmationState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setState('invalid');
      setErrorMessage(
        language === 'de'
          ? 'Bestätigungstoken fehlt.'
          : 'Confirmation token is missing.'
      );
      return;
    }

    // Call confirmation API
    fetch('/api/applications/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const data = await res.json();

        if (!res.ok) {
          setState('error');
          setErrorMessage(
            data.error ||
              (language === 'de'
                ? 'Fehler bei der Bestätigung.'
                : 'Error confirming application.')
          );
          return;
        }

        setState('success');
      })
      .catch((error) => {
        console.error('Error confirming application:', error);
        setState('error');
        setErrorMessage(
          language === 'de'
            ? 'Ein Fehler ist aufgetreten.'
            : 'An error occurred.'
        );
      });
  }, [searchParams, language]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardContent className="p-8 text-center">
            {state === 'loading' && (
              <>
                <Loader2 className="h-16 w-16 mx-auto mb-4 text-primary animate-spin" />
                <h1 className="text-2xl font-semibold mb-2">
                  {language === 'de'
                    ? 'Bestätigung läuft...'
                    : 'Confirming...'}
                </h1>
                <p className="text-muted-foreground">
                  {language === 'de'
                    ? 'Bitte warten Sie, während wir Ihre Bewerbung bestätigen.'
                    : 'Please wait while we confirm your application.'}
                </p>
              </>
            )}

            {state === 'success' && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-3">
                    <CheckCircle2 className="h-16 w-16 text-green-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold mb-2">
                  {language === 'de'
                    ? 'Bewerbung bestätigt!'
                    : 'Application Confirmed!'}
                </h1>
                <p className="text-muted-foreground mb-6">
                  {language === 'de'
                    ? 'Ihre Bewerbung wurde erfolgreich bestätigt und an den Projektkoordinator weitergeleitet.'
                    : 'Your application has been successfully confirmed and forwarded to the project coordinator.'}
                </p>
                <Button asChild>
                  <Link href="/">
                    {language === 'de' ? 'Zur Startseite' : 'Back to Home'}
                  </Link>
                </Button>
              </>
            )}

            {(state === 'error' || state === 'invalid') && (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-red-100 p-3">
                    <XCircle className="h-16 w-16 text-red-600" />
                  </div>
                </div>
                <h1 className="text-2xl font-semibold mb-2">
                  {language === 'de'
                    ? 'Bestätigung fehlgeschlagen'
                    : 'Confirmation Failed'}
                </h1>
                <p className="text-muted-foreground mb-6">{errorMessage}</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" asChild>
                    <Link href="/">
                      {language === 'de' ? 'Zur Startseite' : 'Back to Home'}
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href="/projects">
                      {language === 'de'
                        ? 'Zu den Projekten'
                        : 'View Projects'}
                    </Link>
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
