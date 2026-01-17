import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding, TrackingGoal } from '../../context/OnboardingContext';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/Button';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

const GOALS: { id: TrackingGoal; icon: string; title: string; description: string }[] = [
  {
    id: 'health_patterns',
    icon: '🔍',
    title: 'Find health patterns',
    description: 'Discover connections between food and how I feel',
  },
  {
    id: 'doctor_tracking',
    icon: '🩺',
    title: 'Track for my doctor',
    description: 'Build a dietary record for medical discussions',
  },
  {
    id: 'food_sensitivities',
    icon: '🧪',
    title: 'Identify sensitivities',
    description: 'Figure out which foods might be causing issues',
  },
  {
    id: 'curious',
    icon: '📊',
    title: 'Just curious',
    description: 'See what my eating patterns look like over time',
  },
];

export default function GoalScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { data, setField } = useOnboarding();
  const [selected, setSelected] = useState<TrackingGoal | null>(data.goal);

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

  const handleSelect = (goal: TrackingGoal) => {
    haptics.selection();
    setSelected(goal);
  };

  const handleContinue = () => {
    if (!selected) return;
    haptics.light();
    setField('goal', selected);
    navigation.navigate('SignalTracking');
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StepIndicator
          currentStep={2}
          totalSteps={6}
          onBack={() => navigation.goBack()}
        />

        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              What brings you{'\n'}to DataDiet?
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              This helps us tailor your experience
            </Text>
          </View>

          <ScrollView
            style={styles.options}
            contentContainerStyle={styles.optionsContent}
            showsVerticalScrollIndicator={false}
          >
            {GOALS.map((goal, index) => (
              <GoalOption
                key={goal.id}
                goal={goal}
                isSelected={selected === goal.id}
                onSelect={() => handleSelect(goal.id)}
                colors={colors}
                delay={index * 50}
              />
            ))}
          </ScrollView>

          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selected}
          />
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface GoalOptionProps {
  goal: typeof GOALS[0];
  isSelected: boolean;
  onSelect: () => void;
  colors: any;
  delay: number;
}

function GoalOption({ goal, isSelected, onSelect, colors, delay }: GoalOptionProps) {
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
        styles.option,
        {
          backgroundColor: isSelected ? `${colors.primary}15` : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
        animatedStyle,
      ]}
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={styles.optionIcon}>{goal.icon}</Text>
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>
          {goal.title}
        </Text>
        <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
          {goal.description}
        </Text>
      </View>
      <View
        style={[
          styles.radio,
          {
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent',
          },
        ]}
      >
        {isSelected && <View style={styles.radioInner} />}
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
    marginTop: SPACING.sm,
  },
  options: {
    flex: 1,
    marginTop: SPACING.xxl,
  },
  optionsContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    gap: SPACING.md,
  },
  optionIcon: {
    fontSize: 28,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: 17,
  },
  optionDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
