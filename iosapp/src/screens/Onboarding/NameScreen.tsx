import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/Button';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function NameScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { data, setField } = useOnboarding();
  const [name, setName] = useState(data.name || '');
  const inputRef = useRef<TextInput>(null);

  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);
  const underlineProgress = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 500 }));

    // Auto-focus input after animation
    const timer = setTimeout(() => inputRef.current?.focus(), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    underlineProgress.value = withTiming(name.length > 0 ? 1 : 0, {
      duration: 200,
    });
  }, [name]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const underlineStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      underlineProgress.value,
      [0, 1],
      [colors.border, colors.primary]
    ),
    transform: [{ scaleX: 0.7 + underlineProgress.value * 0.3 }],
  }));

  const handleTextChange = (text: string) => {
    if (text.length === 1 && name.length === 0) {
      haptics.selection();
    }
    setName(text);
  };

  const handleContinue = () => {
    if (name.trim().length === 0) return;
    haptics.light();
    setField('name', name.trim());
    navigation.navigate('Goal');
  };

  const isValid = name.trim().length > 0;

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StepIndicator
          currentStep={1}
          totalSteps={6}
          onBack={() => navigation.goBack()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View style={[styles.content, contentStyle]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                What should we{'\n'}call you?
              </Text>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                style={[styles.input, { color: colors.text }]}
                placeholder="Your name"
                placeholderTextColor={colors.textFaint}
                value={name}
                onChangeText={handleTextChange}
                autoCapitalize="words"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                textAlign="center"
              />
              <Animated.View style={[styles.underline, underlineStyle]} />
            </View>

            <View style={styles.spacer} />

            <Button
              title="Continue"
              onPress={handleContinue}
              disabled={!isValid}
            />
          </Animated.View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  header: {
    marginTop: SPACING.xxxxl,
    alignItems: 'center',
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    lineHeight: TYPOGRAPHY.lineHeights.displaySmall,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: SPACING.xxxxl * 1.5,
    alignItems: 'center',
  },
  input: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 48,
    width: '100%',
    paddingVertical: SPACING.sm,
  },
  underline: {
    height: 3,
    width: '70%',
    borderRadius: 2,
    marginTop: SPACING.sm,
  },
  spacer: {
    flex: 1,
  },
});
