import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { StepIndicator } from '../../components/StepIndicator';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

export default function SignalTrackingScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { setField } = useOnboarding();

  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 500 }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const handleTrackEverything = () => {
    haptics.medium();
    setField('trackEverything', true);
    setField('trackingSignals', []);
    navigation.navigate('Permissions');
  };

  const handleCustomize = () => {
    haptics.light();
    navigation.navigate('CustomSignals');
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StepIndicator
          currentStep={3}
          totalSteps={6}
          onBack={() => navigation.goBack()}
        />

        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              What should AI{'\n'}watch for?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              DataDiet can track patterns in your meals to help you understand your eating habits.
            </Text>
          </View>

          <View style={styles.options}>
            <OptionCard
              icon="chart-timeline-variant"
              title="Track everything"
              description="AI monitors all dietary signals like processed foods, caffeine, late meals, and more"
              onPress={handleTrackEverything}
              colors={colors}
              recommended
              delay={200}
            />

            <OptionCard
              icon="tune-variant"
              title="Let me customize"
              description="Choose specific signals you want to track"
              onPress={handleCustomize}
              colors={colors}
              delay={300}
            />
          </View>

          <View style={styles.spacer} />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface OptionCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  colors: any;
  recommended?: boolean;
  delay: number;
}

function OptionCard({
  icon,
  title,
  description,
  onPress,
  colors,
  recommended,
  delay,
}: OptionCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      style={[
        styles.optionCard,
        {
          backgroundColor: colors.surface,
          borderColor: recommended ? colors.primary : colors.border,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      {recommended && (
        <View style={[styles.recommendedBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.recommendedText}>Recommended</Text>
        </View>
      )}

      <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <Icon
          name={icon as any}
          size={28}
          color={colors.primary}
        />
      </View>

      <Text style={[styles.optionTitle, { color: colors.text }]}>
        {title}
      </Text>

      <Text style={[styles.optionDescription, { color: colors.textMuted }]}>
        {description}
      </Text>

      <View style={styles.arrowContainer}>
        <Icon
          name="chevron-right"
          size={24}
          color={colors.textMuted}
        />
      </View>
    </AnimatedPressable>
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
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    lineHeight: TYPOGRAPHY.lineHeights.displaySmall,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    lineHeight: TYPOGRAPHY.lineHeights.bodyLarge,
    marginTop: SPACING.md,
  },
  options: {
    gap: SPACING.lg,
  },
  optionCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: SPACING.lg,
    right: SPACING.lg,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.pill,
  },
  recommendedText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.labelSmall,
    color: '#FFFFFF',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  optionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.headlineSmall,
    marginBottom: SPACING.sm,
  },
  optionDescription: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
    lineHeight: 20,
  },
  arrowContainer: {
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.xl,
  },
  spacer: {
    flex: 1,
  },
});
