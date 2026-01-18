'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Route error:', error);
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-warm-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <AlertTriangle className="w-10 h-10 text-rose-600" />
        </div>
        <h1 className="text-display text-3xl text-warm-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-warm-500 mb-8">
          We encountered an unexpected error while loading this page.
          Please try again or return to the home page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="btn btn-secondary inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
