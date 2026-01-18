'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { ChartWrapper, ChartEmptyState } from './ChartWrapper';
import { EnhancedMealTimingData } from '@/services/insights';

interface MealTimingComparisonProps {
  data: EnhancedMealTimingData[];
}

export function MealTimingComparison({ data }: MealTimingComparisonProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = useMemo(() => ({
    weekday: isDark ? '#7a967a' : '#5c7a5c', // sage
    weekend: isDark ? '#a78bfa' : '#8b5cf6', // violet
    danger: isDark ? '#fb7185' : '#f43f5e', // rose
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    text: isDark ? '#a3a3a3' : '#78716c',
  }), [isDark]);

  const hasData = data.some(d => d.weekday > 0 || d.weekend > 0);

  if (!hasData) {
    return (
      <ChartWrapper
        title="Meal Timing Comparison"
        subtitle="Compare weekday vs weekend patterns"
      >
        <ChartEmptyState message="Log more meals to see timing patterns" />
      </ChartWrapper>
    );
  }

  // Find the late slot index for reference line
  const lateSlotIndex = data.findIndex(d => d.isDangerZone);

  return (
    <ChartWrapper
      title="Meal Timing Comparison"
      subtitle="Do your eating patterns differ on weekends?"
      minHeight={280}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            horizontal={false}
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: colors.text }}
            tickLine={false}
            axisLine={{ stroke: colors.grid }}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="slot"
            tick={{ fontSize: 10, fill: colors.text }}
            tickLine={false}
            axisLine={false}
            width={90}
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
              color: isDark ? '#a3a3a3' : '#57534e',
              fontSize: '13px',
            }}
            formatter={(value, name) => [
              `${value} meals`,
              name === 'weekday' ? 'Weekdays' : 'Weekends',
            ]}
          />
          <Legend
            wrapperStyle={{ paddingTop: '16px' }}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: colors.text, fontSize: '12px' }}>
                {value === 'weekday' ? 'Weekdays' : 'Weekends'}
              </span>
            )}
          />
          <Bar
            dataKey="weekday"
            name="weekday"
            radius={[0, 4, 4, 0]}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`weekday-${index}`}
                fill={entry.isDangerZone ? colors.danger : colors.weekday}
                opacity={entry.isDangerZone ? 0.9 : 1}
              />
            ))}
          </Bar>
          <Bar
            dataKey="weekend"
            name="weekend"
            radius={[0, 4, 4, 0]}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell
                key={`weekend-${index}`}
                fill={entry.isDangerZone ? colors.danger : colors.weekend}
                opacity={entry.isDangerZone ? 0.9 : 1}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Danger zone indicator */}
      <div className="mt-3 flex items-center justify-center gap-2 text-xs text-warm-500 dark:text-neutral-400">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: colors.danger }}
        />
        <span>Late night (9pm+) eating zone</span>
      </div>
    </ChartWrapper>
  );
}
