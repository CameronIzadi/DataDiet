import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { TYPOGRAPHY } from '../../config/designSystem';

interface Props {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: Props) {
  const { colors } = useTheme();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate logo in
    logoOpacity.value = withTiming(1, { duration: 600 });
    logoScale.value = withTiming(1, {
      duration: 600,
      easing: Easing.out(Easing.back(1.5)),
    });

    // Animate tagline in after delay
    taglineOpacity.value = withDelay(400, withTiming(1, { duration: 500 }));

    // Complete after animation
    const timeout = setTimeout(onComplete, 2000);
    return () => clearTimeout(timeout);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <Text style={[styles.logoText, { color: colors.text }]}>DataDiet</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { color: colors.textMuted }, taglineStyle]}>
        Your dietary black box
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 56,
    letterSpacing: -1,
  },
  tagline: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    marginTop: 12,
  },
});
