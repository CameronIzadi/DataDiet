'use client';

import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { ChartWrapper, ChartEmptyState } from './ChartWrapper';
import { FlagDistributionData } from '@/services/insights';
import { getFlagColor } from './chartTheme';

interface FlagDistributionChartProps {
  data: FlagDistributionData[];
  totalMeals: number;
}

export function FlagDistributionChart({ data, totalMeals }: FlagDistributionChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = useMemo(() => {
    return data.map(item => getFlagColor(item.flag, isDark));
  }, [data, isDark]);

  const totalFlags = useMemo(() => {
    return data.reduce((sum, item) => sum + item.value, 0);
  }, [data]);

  if (data.length === 0) {
    return (
      <ChartWrapper
        title="Flag Breakdown"
        subtitle="Distribution of dietary flags"
      >
        <ChartEmptyState message="No flags detected yet" />
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper
      title="Flag Breakdown"
      subtitle="What are your biggest problem areas?"
      minHeight={280}
    >
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
              label={({ percent }) =>
                (percent ?? 0) > 0.1 ? `${((percent ?? 0) * 100).toFixed(0)}%` : ''
              }
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index]}
                  stroke={isDark ? '#171717' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
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
              }}
              itemStyle={{
                color: isDark ? '#d4d4d4' : '#44403c',
              }}
              formatter={(value, name) => [
                `${value} occurrences`,
                String(name),
              ]}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-2xl font-bold text-warm-800 dark:text-neutral-200">
              {totalFlags}
            </div>
            <div className="text-xs text-warm-500 dark:text-neutral-400">
              total flags
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.slice(0, 6).map((item, index) => (
          <div
            key={item.flag}
            className="flex items-center gap-1.5 text-xs text-warm-600 dark:text-neutral-400"
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: colors[index] }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </ChartWrapper>
  );
}
