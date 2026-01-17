import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/Button';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();

  const headlineOpacity = useSharedValue(0);
  const headlineTranslate = useSharedValue(30);
  const descOpacity = useSharedValue(0);
  const descTranslate = useSharedValue(20);
  const featuresOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslate = useSharedValue(20);

  useEffect(() => {
    // Staggered fade-in animation
    headlineOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
    headlineTranslate.value = withDelay(100, withTiming(0, { duration: 600 }));

    descOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
    descTranslate.value = withDelay(300, withTiming(0, { duration: 500 }));

    featuresOpacity.value = withDelay(500, withTiming(1, { duration: 500 }));

    buttonsOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    buttonsTranslate.value = withDelay(700, withTiming(0, { duration: 500 }));
  }, []);

  const headlineStyle = useAnimatedStyle(() => ({
    opacity: headlineOpacity.value,
    transform: [{ translateY: headlineTranslate.value }],
  }));

  const descStyle = useAnimatedStyle(() => ({
    opacity: descOpacity.value,
    transform: [{ translateY: descTranslate.value }],
  }));

  const featuresStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslate.value }],
  }));

  const handleGetStarted = () => {
    haptics.light();
    navigation.navigate('Onboarding');
  };

  const handleLogin = () => {
    haptics.light();
    navigation.navigate('Login');
  };

  const features = [
    { icon: '📸', text: 'Capture meals effortlessly' },
    { icon: '🧠', text: 'AI spots patterns you miss' },
    { icon: '🩺', text: 'Reports ready for your doctor' },
  ];

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Animated.View style={headlineStyle}>
              <Text style={[styles.headline, { color: colors.text }]}>
                Your dietary{'\n'}black box
              </Text>
            </Animated.View>

            <Animated.Text style={[styles.description, { color: colors.textMuted }, descStyle]}>
              Capture what you eat, forget about it, and have answers when your
              body—or your doctor—asks questions.
            </Animated.Text>
          </View>

          <Animated.View style={[styles.features, featuresStyle]}>
            {features.map((feature, index) => (
              <FeatureRow
                key={index}
                icon={feature.icon}
                text={feature.text}
                colors={colors}
                delay={index * 100}
              />
            ))}
          </Animated.View>

          <Animated.View style={[styles.buttons, buttonsStyle]}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
            />
            <TouchableOpacity
              onPress={handleLogin}
              style={styles.loginButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.loginText, { color: colors.textMuted }]}>
                I already have an account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface FeatureRowProps {
  icon: string;
  text: string;
  colors: any;
  delay: number;
}

function FeatureRow({ icon, text, colors, delay }: FeatureRowProps) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-10);

  useEffect(() => {
    opacity.value = withDelay(500 + delay, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(500 + delay, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.featureRow,
        { backgroundColor: colors.surface },
        animatedStyle,
      ]}
    >
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={[styles.featureText, { color: colors.text }]}>
        {text}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xxxxl,
    justifyContent: 'space-between',
    paddingBottom: SPACING.xxl,
  },
  header: {},
  headline: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displayLarge,
    lineHeight: TYPOGRAPHY.lineHeights.displayLarge,
    letterSpacing: -1.5,
  },
  description: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    lineHeight: TYPOGRAPHY.lineHeights.bodyLarge,
    marginTop: SPACING.lg,
  },
  features: {
    gap: SPACING.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    flex: 1,
  },
  buttons: {
    gap: SPACING.md,
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  loginText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
});
