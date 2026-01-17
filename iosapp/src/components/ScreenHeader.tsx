import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, DARK, LIGHT } from '../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
}

export function ScreenHeader({ title, onBack, rightElement }: ScreenHeaderProps) {
  const { colors, themeProgress } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(-10);

  useEffect(() => {
    opacity.value = withDelay(50, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(50, withTiming(0, { duration: 300 }));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = () => {
    haptics.light();
    onBack?.();
  };

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.surface, DARK.surface]
    ),
  }));

  const headerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  return (
    <Animated.View style={[styles.container, headerStyle]}>
      {onBack ? (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[styles.backButton, buttonStyle]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Icon
            name="chevron-left"
            size={24}
            color={colors.text}
          />
        </AnimatedPressable>
      ) : (
        <View style={styles.placeholder} />
      )}

      <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>

      {rightElement || <View style={styles.placeholder} />}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.headlineMedium,
    flex: 1,
    textAlign: 'center',
  },
});
