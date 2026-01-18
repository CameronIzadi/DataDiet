'use client';

import { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { ChartWrapper, ChartEmptyState } from './ChartWrapper';
import { NutritionBalanceData } from '@/services/insights';

interface NutritionRadarProps {
  data: NutritionBalanceData[] | null;
}

export function NutritionRadar({ data }: NutritionRadarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = useMemo(() => ({
    primary: isDark ? '#34d399' : '#10b981', // emerald
    fill: isDark ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.2)',
    grid: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
    text: isDark ? '#a3a3a3' : '#78716c',
    reference: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)',
  }), [isDark]);

  if (!data) {
    return (
      <ChartWrapper
        title="Nutrition Balance"
        subtitle="Macro distribution across your meals"
        fullWidth
      >
        <ChartEmptyState message="Need at least 3 meals with nutrition data to show balance" />
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper
      title="Nutrition Balance"
      subtitle="Is your diet balanced or skewed toward certain macros?"
      fullWidth
      minHeight={320}
    >
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart
          cx="50%"
          cy="50%"
          outerRadius="70%"
          data={data}
        >
          <PolarGrid
            stroke={colors.grid}
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="metric"
            tick={{
              fontSize: 12,
              fill: colors.text,
              fontWeight: 500,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: colors.text }}
            tickCount={5}
            axisLine={false}
          />
          {/* Reference circle at 80 (target) */}
          <Radar
            name="Target"
            dataKey="fullMark"
            stroke={colors.reference}
            fill="transparent"
            strokeDasharray="5 5"
            strokeWidth={1}
          />
          <Radar
            name="Your Balance"
            dataKey="value"
            stroke={colors.primary}
            fill={colors.fill}
            strokeWidth={2}
            animationDuration={800}
            dot={{
              r: 4,
              fill: colors.primary,
              strokeWidth: 0,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: isDark ? '#171717' : '#ffffff',
              borderColor: isDark ? '#262626' : '#e7e5e4',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}
            labelStyle={{
              color: isDark ? '#fafafa' : '#1c1917',
              fontWeight: 600,
              marginBottom: '4px',
            }}
            itemStyle={{
              color: isDark ? '#d4d4d4' : '#44403c',
            }}
            formatter={(value) => [`${Math.round(Number(value ?? 0))}%`, 'vs Target']}
          />
        </RadarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex justify-center gap-6 text-xs text-warm-500 dark:text-neutral-400">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-0.5 rounded"
            style={{ backgroundColor: colors.primary }}
          />
          <span>Your Balance</span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-0.5 rounded border-dashed"
            style={{
              borderTop: `2px dashed ${colors.reference}`,
              backgroundColor: 'transparent',
            }}
          />
          <span>Target (80% = ideal)</span>
        </div>
      </div>
    </ChartWrapper>
  );
}
