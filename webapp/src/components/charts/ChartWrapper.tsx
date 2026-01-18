'use client';

import { ReactNode } from 'react';

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  minHeight?: number;
}

export function ChartWrapper({
  title,
  subtitle,
  children,
  className = '',
  fullWidth = false,
  minHeight = 300,
}: ChartWrapperProps) {
  return (
    <div
      className={`card-elevated ${fullWidth ? 'col-span-full' : ''} ${className}`}
    >
      <div className="mb-4">
        <h3 className="font-semibold text-warm-800 dark:text-neutral-200">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-warm-500 dark:text-neutral-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
      <div
        className="w-full"
        style={{ minHeight: `${minHeight}px` }}
      >
        {children}
      </div>
    </div>
  );
}

// Empty state component for charts with insufficient data
export function ChartEmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full min-h-[200px] text-warm-400 dark:text-neutral-500">
      <div className="text-center">
        <svg
          className="w-12 h-12 mx-auto mb-3 opacity-50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}
