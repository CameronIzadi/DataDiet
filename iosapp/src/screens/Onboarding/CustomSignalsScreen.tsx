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
import {
  useOnboarding,
  TRACKING_SIGNALS,
  TrackingSignal,
} from '../../context/OnboardingContext';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/Button';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

export default function CustomSignalsScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { data, setMultipleFields } = useOnboarding();

  const [selectedSignals, setSelectedSignals] = useState<TrackingSignal[]>(
    data.trackingSignals
  );

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

  const toggleSignal = (signal: TrackingSignal) => {
    if (selectedSignals.includes(signal)) {
      setSelectedSignals(prev => prev.filter(s => s !== signal));
    } else {
      setSelectedSignals(prev => [...prev, signal]);
    }
  };

  const handleContinue = () => {
    haptics.medium();
    setMultipleFields({
      trackEverything: false,
      trackingSignals: selectedSignals,
    });
    navigation.navigate('Permissions');
  };

  const isValid = selectedSignals.length > 0;

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
              Select signals
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              Pick what you want to track. You can change this later.
            </Text>
          </View>

          <ScrollView
            style={styles.signalsScroll}
            contentContainerStyle={styles.signalsContent}
            showsVerticalScrollIndicator={false}
          >
            {TRACKING_SIGNALS.map((signal, index) => (
              <SignalRow
                key={signal.id}
                signal={signal}
                isSelected={selectedSignals.includes(signal.id)}
                onPress={() => toggleSignal(signal.id)}
                colors={colors}
                delay={index * 40}
              />
            ))}
          </ScrollView>

          <View style={styles.footer}>
            {selectedSignals.length > 0 && (
              <Text style={[styles.selectedCount, { color: colors.textMuted }]}>
                {selectedSignals.length} selected
              </Text>
            )}
            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!isValid}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

interface SignalRowProps {
  signal: typeof TRACKING_SIGNALS[0];
  isSelected: boolean;
  onPress: () => void;
  colors: any;
  delay: number;
}

function SignalRow({
  signal,
  isSelected,
  onPress,
  colors,
  delay,
}: SignalRowProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      style={[
        styles.signalRow,
        {
          backgroundColor: isSelected ? `${colors.primary}12` : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Text style={styles.signalIcon}>{signal.icon}</Text>
      <View style={styles.signalText}>
        <Text style={[styles.signalLabel, { color: colors.text }]}>
          {signal.label}
        </Text>
        <Text style={[styles.signalDescription, { color: colors.textMuted }]}>
          {signal.description}
        </Text>
      </View>
      <View
        style={[
          styles.checkbox,
          {
            borderColor: isSelected ? colors.primary : colors.border,
            backgroundColor: isSelected ? colors.primary : 'transparent',
          },
        ]}
      >
        {isSelected && (
          <Text style={styles.checkmark}>✓</Text>
        )}
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
  },
  header: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    marginTop: SPACING.sm,
  },
  signalsScroll: {
    flex: 1,
  },
  signalsContent: {
    gap: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    gap: SPACING.md,
  },
  signalIcon: {
    fontSize: 24,
  },
  signalText: {
    flex: 1,
  },
  signalLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  signalDescription: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    paddingVertical: SPACING.xxl,
  },
  selectedCount: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
});
