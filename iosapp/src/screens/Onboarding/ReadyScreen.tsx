import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CommonActions } from '@react-navigation/native';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { useAuth } from '../../context/AuthContext';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/Button';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function ReadyScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { data, clearData } = useOnboarding();
  const { completeOnboarding } = useAuth();

  const checkOpacity = useSharedValue(0);
  const checkScale = useSharedValue(0.3);
  const checkRotate = useSharedValue(-45);
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(30);
  const cardsOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    // Animate check icon with bounce
    checkOpacity.value = withDelay(200, withTiming(1, { duration: 300 }));
    checkScale.value = withDelay(
      200,
      withSequence(
        withSpring(1.2, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      )
    );
    checkRotate.value = withDelay(200, withSpring(0, { damping: 10, stiffness: 100 }));

    // Animate title
    titleOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    titleTranslate.value = withDelay(500, withTiming(0, { duration: 400 }));

    // Animate cards
    cardsOpacity.value = withDelay(700, withTiming(1, { duration: 400 }));

    // Animate button
    buttonOpacity.value = withDelay(900, withTiming(1, { duration: 400 }));

    // Haptic feedback
    const timer = setTimeout(() => {
      haptics.success();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const checkStyle = useAnimatedStyle(() => ({
    opacity: checkOpacity.value,
    transform: [
      { scale: checkScale.value },
      { rotate: `${checkRotate.value}deg` },
    ],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  const cardsStyle = useAnimatedStyle(() => ({
    opacity: cardsOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
  }));

  const handleStart = async () => {
    haptics.medium();
    // Mark onboarding as complete
    await completeOnboarding();
    // Clear temporary onboarding data
    clearData();
    // Navigate to Main app, resetting the navigation stack
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };

  const firstName = data.name.split(' ')[0] || 'there';

  const tips = [
    { icon: 'camera', text: 'Snap a photo before eating' },
    { icon: 'meditation', text: "Don't stress about logging every meal" },
    { icon: 'chart-line', text: 'Check insights when you need answers' },
  ];

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StepIndicator
          currentStep={6}
          totalSteps={6}
          showBack={false}
        />

        <View style={styles.content}>
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.checkCircle,
                { backgroundColor: `${colors.success}20` },
                checkStyle,
              ]}
            >
              <Icon
                name="check"
                size={44}
                color={colors.success}
              />
            </Animated.View>

            <Animated.View style={titleStyle}>
              <Text style={[styles.title, { color: colors.text }]}>
                You're all set,{'\n'}{firstName}!
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                Start capturing your meals. We'll handle the rest.
              </Text>
            </Animated.View>
          </View>

          <Animated.View style={[styles.tips, cardsStyle]}>
            <Text style={[styles.tipsTitle, { color: colors.textMuted }]}>
              QUICK TIPS
            </Text>
            {tips.map((tip, index) => (
              <View
                key={index}
                style={[styles.tipRow, { backgroundColor: colors.surface }]}
              >
                <View style={[styles.tipIconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Icon
                    name={tip.icon as any}
                    size={22}
                    color={colors.primary}
                  />
                </View>
                <Text style={[styles.tipText, { color: colors.text }]}>
                  {tip.text}
                </Text>
              </View>
            ))}
          </Animated.View>

          <View style={styles.spacer} />

          <Animated.View style={buttonStyle}>
            <Button
              title="Start Capturing"
              onPress={handleStart}
            />
          </Animated.View>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxxl,
  },
  checkCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  tips: {
    marginTop: SPACING.xxxxl,
    gap: SPACING.md,
  },
  tipsTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.labelSmall,
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: SPACING.md,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
});
