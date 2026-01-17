import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { SPACING, RADIUS, DARK, LIGHT } from '../../config/designSystem';

interface BarData {
  value: number;
  label?: string;
}

interface MiniBarChartProps {
  data: BarData[];
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  concernLevel?: 'low' | 'moderate' | 'elevated';
  showLabels?: boolean;
  animate?: boolean;
}

const AnimatedBar: React.FC<{
  value: number;
  maxValue: number;
  height: number;
  width: number;
  color: string;
  delay: number;
  animate: boolean;
}> = ({ value, maxValue, height, width, color, delay, animate }) => {
  const animatedHeight = useSharedValue(0);
  const targetHeight = maxValue > 0 ? (value / maxValue) * height : 0;

  useEffect(() => {
    if (animate) {
      animatedHeight.value = withDelay(
        delay,
        withTiming(targetHeight, {
          duration: 600,
          easing: Easing.out(Easing.cubic),
        })
      );
    } else {
      animatedHeight.value = targetHeight;
    }
  }, [value, maxValue, animate, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
  }));

  return (
    <View style={[styles.barContainer, { height, width }]}>
      <Animated.View
        style={[
          styles.bar,
          {
            width,
            backgroundColor: color,
            borderRadius: width / 2,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
};

const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  height = 40,
  barWidth = 6,
  gap = 4,
  color,
  concernLevel = 'low',
  showLabels = false,
  animate = true,
}) => {
  const { isDark, colors } = useTheme();
  const theme = isDark ? DARK : LIGHT;

  // Determine color based on concern level
  const getBarColor = () => {
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

  const barColor = getBarColor();
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { height }]}>
        {data.map((item, index) => (
          <AnimatedBar
            key={index}
            value={item.value}
            maxValue={maxValue}
            height={height}
            width={barWidth}
            color={barColor}
            delay={index * 50}
            animate={animate}
          />
        ))}
      </View>
      {showLabels && (
        <View style={styles.labelsContainer}>
          {data.map((item, index) => (
            <View key={index} style={[styles.labelWrapper, { width: barWidth + gap }]}>
              {item.label && (
                <Animated.Text
                  style={[styles.label, { color: theme.textSoft }]}
                  numberOfLines={1}
                >
                  {item.label}
                </Animated.Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  barContainer: {
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
  },
  labelsContainer: {
    flexDirection: 'row',
    marginTop: SPACING.xs,
  },
  labelWrapper: {
    alignItems: 'center',
  },
  label: {
    fontSize: 9,
    fontFamily: 'Outfit_500Medium',
  },
});

export default React.memo(MiniBarChart);
