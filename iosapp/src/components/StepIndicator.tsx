import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { haptics } from '../utils/haptics';
import { SPACING } from '../config/designSystem';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onBack?: () => void;
  showBack?: boolean;
}

export function StepIndicator({
  currentStep,
  totalSteps,
  onBack,
  showBack = true,
}: StepIndicatorProps) {
  const { colors } = useTheme();
  const progress = currentStep / totalSteps;

  const handleBack = () => {
    haptics.light();
    onBack?.();
  };

  const progressStyle = useAnimatedStyle(() => ({
    width: withTiming(`${progress * 100}%`, {
      duration: 400,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  }));

  return (
    <View style={styles.container}>
      {/* Back button */}
      {showBack && onBack ? (
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          activeOpacity={0.7}
        >
          <Icon
            name="chevron-left"
            size={28}
            color={colors.text}
          />
        </TouchableOpacity>
      ) : (
        <View style={styles.backButton} />
      )}

      {/* Progress bar - centered */}
      <View style={styles.progressContainer}>
        <View style={[styles.track, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: colors.primary },
              progressStyle,
            ]}
          />
        </View>
      </View>

      {/* Right spacer for visual balance */}
      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  spacer: {
    width: 44,
  },
});
