import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();

  const headlineOpacity = useSharedValue(0);
  const descOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  useEffect(() => {
    // Staggered fade-in animation
    headlineOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    descOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    buttonsOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
  }, []);

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  const handleGetStarted = () => {
    haptics.light();
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    haptics.light();
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Animated.Text style={[styles.headline, { color: colors.text }, headlineStyle]}>
            DataDiet
          </Animated.Text>
        </View>

        <View style={styles.centerSection}>
          <Animated.Text style={[styles.description, { color: colors.textMuted }, descStyle]}>
            Your dietary black box for answers when your body or your doctor asks questions.
          </Animated.Text>
        </View>

        <View style={styles.bottomSection}>
          <Animated.View style={buttonsStyle}>
            <TouchableOpacity
              onPress={handleGetStarted}
              style={[
                styles.getStartedButton,
                {
                  backgroundColor: isDark ? '#FFFFFF' : colors.surface,
                  borderColor: isDark ? 'transparent' : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.getStartedText, { color: isDark ? '#0D0D0F' : colors.text }]}>
                Get Started
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={buttonsStyle}>
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.loginButton, { borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.loginText, { color: colors.text }]}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
  },
  topSection: {
    paddingTop: SPACING.xxxl,
    alignItems: 'center',
  },
  headline: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 52,
    lineHeight: 60,
    textAlign: 'center',
    letterSpacing: -1.5,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  description: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: 22,
    lineHeight: 30,
    textAlign: 'center',
  },
  bottomSection: {
    paddingBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  getStartedButton: {
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  getStartedText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: 17,
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
    borderWidth: 1,
    borderRadius: RADIUS.lg,
  },
  loginText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
});
