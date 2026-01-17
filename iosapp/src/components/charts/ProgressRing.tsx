import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import Text from '../Text';
import { DARK, LIGHT } from '../../config/designSystem';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  concernLevel?: 'low' | 'moderate' | 'elevated';
  showValue?: boolean;
  valueLabel?: string;
  animate?: boolean;
}

const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 64,
  strokeWidth = 6,
  color,
  concernLevel = 'low',
  showValue = true,
  valueLabel,
  animate = true,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? DARK : LIGHT;
  const animatedProgress = useSharedValue(0);

  // Determine color based on concern level
  const getRingColor = () => {
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

  const ringColor = getRingColor();
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const center = size / 2;

  useEffect(() => {
    if (animate) {
      animatedProgress.value = withTiming(Math.min(progress, 100), {
        duration: 800,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      animatedProgress.value = Math.min(progress, 100);
    }
  }, [progress, animate]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  // Background track color
  const trackColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${center}, ${center}`}>
          {/* Background track */}
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress arc */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={radius}
            stroke={ringColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      {showValue && (
        <View style={styles.valueContainer}>
          <Text variant="dataSmall" color="primary" style={styles.value}>
            {Math.round(progress)}
          </Text>
          {valueLabel && (
            <Text variant="labelSmall" color="soft" style={styles.label}>
              {valueLabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    textAlign: 'center',
  },
  label: {
    textAlign: 'center',
    marginTop: -2,
  },
});

export default React.memo(ProgressRing);
