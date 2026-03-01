'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-transparent to-primary/10">
      <div className="max-w-2xl w-full px-6 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="rounded-full bg-red-100 p-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          Oops! Something went wrong
        </h1>

        <p className="text-xl text-muted-foreground mb-8">
          We encountered an unexpected error. Please try reloading the page.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={reset}
          >
            Try Again
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => window.location.href = '/'}
          >
            Go Home
          </Button>
        </div>

        {error.message && (
          <details className="mt-8 text-left bg-muted/30 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-sm mb-2">
              Error Details
            </summary>
            <pre className="text-xs text-muted-foreground overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
