'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { ChartWrapper, ChartEmptyState } from './ChartWrapper';
import { WeeklyTrendData } from '@/services/insights';

interface WeeklyTrendChartProps {
  data: WeeklyTrendData[];
}

export function WeeklyTrendChart({ data }: WeeklyTrendChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const colors = useMemo(() => ({
    processed: isDark ? '#fb7185' : '#f43f5e',
    timing: isDark ? '#a78bfa' : '#8b5cf6',
    plastic: isDark ? '#60a5fa' : '#3b82f6',
    grid: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
    text: isDark ? '#a3a3a3' : '#78716c',
  }), [isDark]);

  if (data.length < 3) {
    return (
      <ChartWrapper
        title="Weekly Flag Trend"
        subtitle="Track your dietary habits over time"
        fullWidth
      >
        <ChartEmptyState message="Log more meals to see your weekly trends" />
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper
      title="Weekly Flag Trend"
      subtitle="Daily flag counts over time - are your habits improving?"
      fullWidth
      minHeight={300}
    >
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="gradientProcessed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.processed} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.processed} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientTiming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.timing} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.timing} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradientPlastic" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.plastic} stopOpacity={0.3} />
              <stop offset="95%" stopColor={colors.plastic} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={colors.grid}
            vertical={false}
          />
          <XAxis
            dataKey="dateShort"
            tick={{ fontSize: 11, fill: colors.text }}
            tickLine={false}
            axisLine={{ stroke: colors.grid }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: colors.text }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
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
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: colors.text, fontSize: '12px' }}>{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="processed"
            name="Processed Foods"
            stroke={colors.processed}
            strokeWidth={2}
            fill="url(#gradientProcessed)"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="timing"
            name="Timing Issues"
            stroke={colors.timing}
            strokeWidth={2}
            fill="url(#gradientTiming)"
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="plastic"
            name="Plastic Exposure"
            stroke={colors.plastic}
            strokeWidth={2}
            fill="url(#gradientPlastic)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
