'use client';

import { FileQuestion, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-warm-50">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-warm-200 rounded-full flex items-center justify-center mx-auto mb-8">
          <FileQuestion className="w-10 h-10 text-warm-500" />
        </div>
        <h1 className="text-display text-4xl text-warm-900 mb-3">
          404
        </h1>
        <h2 className="text-xl font-medium text-warm-700 mb-4">
          Page not found
        </h2>
        <p className="text-warm-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary inline-flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
