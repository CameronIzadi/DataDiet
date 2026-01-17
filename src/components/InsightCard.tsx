'use client';

import { ReactNode } from 'react';

interface InsightCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  unit?: string;
  context: string;
  concernLevel: 'low' | 'moderate' | 'elevated';
  subtext?: string;
}

export function InsightCard({
  icon,
  title,
  value,
  unit,
  context,
  concernLevel,
  subtext
}: InsightCardProps) {
  const concernStyles = {
    low: {
      badge: 'concern-low',
      label: 'Normal'
    },
    moderate: {
      badge: 'concern-moderate',
      label: 'Moderate'
    },
    elevated: {
      badge: 'concern-elevated',
      label: 'Elevated'
    }
  };

  const styles = concernStyles[concernLevel];

  return (
    <div className="card-elevated group">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sage-100 flex items-center justify-center text-sage-600 group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-warm-800">{title}</h3>
            <span className={`concern-indicator ${styles.badge}`}>
              {styles.label}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <span className="text-display text-4xl text-warm-900">{value}</span>
        {unit && <span className="text-lg text-warm-400 ml-2">{unit}</span>}
      </div>
      
      <p className="text-sm text-warm-500 leading-relaxed mb-3">{context}</p>
      
      {subtext && (
        <p className="text-xs text-warm-400 pt-3 border-t border-warm-100">
          {subtext}
        </p>
      )}
    </div>
  );
}
