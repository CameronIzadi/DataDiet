import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { DARK, LIGHT } from '../../config/designSystem';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface MiniTrendLineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  concernLevel?: 'low' | 'moderate' | 'elevated';
  showFill?: boolean;
  animate?: boolean;
  strokeWidth?: number;
}

const MiniTrendLine: React.FC<MiniTrendLineProps> = ({
  data,
  width = 80,
  height = 32,
  color,
  concernLevel = 'low',
  showFill = true,
  animate = true,
  strokeWidth = 2,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? DARK : LIGHT;
  const progress = useSharedValue(0);

  // Determine color based on concern level
  const getLineColor = () => {
    if (color) return color;
    switch (concernLevel) {
      case 'elevated':
        return theme.error;
      case 'moderate':
        return theme.warning;
      default:
        return theme.success;
    }
  };

  const lineColor = getLineColor();

  useEffect(() => {
    if (animate) {
      progress.value = withTiming(1, {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      progress.value = 1;
    }
  }, [animate]);

  // Generate SVG path from data
  const generatePath = () => {
    if (data.length < 2) return '';

    const padding = strokeWidth;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minVal) / range) * chartHeight;
      return { x, y };
    });

    // Create smooth curve using quadratic bezier
    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midX = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x} ${prev.y} ${midX} ${(prev.y + curr.y) / 2}`;
    }

    // Add last point
    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;

    return path;
  };

  const generateFillPath = () => {
    const linePath = generatePath();
    if (!linePath) return '';

    const padding = strokeWidth;
    const chartWidth = width - padding * 2;

    // Close the path for fill
    return `${linePath} L ${padding + chartWidth} ${height} L ${padding} ${height} Z`;
  };

  const linePath = generatePath();
  const fillPath = generateFillPath();
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  // Determine trend direction
  const getTrendIndicator = () => {
    if (data.length < 2) return 'flat';
    const first = data.slice(0, Math.ceil(data.length / 2)).reduce((a, b) => a + b, 0) / Math.ceil(data.length / 2);
    const second = data.slice(Math.ceil(data.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(data.length / 2);

    if (second > first * 1.1) return 'up';
    if (second < first * 0.9) return 'down';
    return 'flat';
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity={0.3} />
            <Stop offset="1" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {/* Fill area */}
        {showFill && fillPath && (
          <Path d={fillPath} fill={`url(#${gradientId})`} />
        )}

        {/* Line */}
        {linePath && (
          <Path
            d={linePath}
            stroke={lineColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(MiniTrendLine);
