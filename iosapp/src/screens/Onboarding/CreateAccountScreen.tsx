import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function CreateAccountScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { signup, error, clearError } = useAuth();
  const { data } = useOnboarding();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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

  const isValid = email.length > 0 && password.length >= 6;

  const handleCreateAccount = async () => {
    if (!isValid) return;
    setLoading(true);
    clearError();
    haptics.medium();

    try {
      // Create account with name from onboarding
      await signup(email, password, data.name);
      haptics.success();
      // Navigate to Ready screen
      navigation.navigate('Ready');
    } catch (err) {
      haptics.error();
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StepIndicator
          currentStep={5}
          totalSteps={6}
          onBack={() => navigation.goBack()}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.content, contentStyle]}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Create your{'\n'}account
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Save your data and access it anywhere
                </Text>
              </View>

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: `${colors.error}15` }]}>
                  <Text style={[styles.errorText, { color: colors.error }]}>
                    {error}
                  </Text>
                </View>
              )}

              <View style={styles.form}>
                <Input
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />

                <Input
                  label="Password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  autoComplete="new-password"
                />
              </View>

              <View style={styles.spacer} />

              <Button
                title="Create Account"
                onPress={handleCreateAccount}
                disabled={!isValid}
                loading={loading}
              />

              <Text style={[styles.terms, { color: colors.textFaint }]}>
                By creating an account, you agree to our Terms of Service and Privacy Policy
              </Text>
            </Animated.View>
          </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
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
    marginTop: SPACING.sm,
  },
  errorContainer: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
    textAlign: 'center',
  },
  form: {
    marginBottom: SPACING.xl,
  },
  spacer: {
    flex: 1,
    minHeight: SPACING.xxl,
  },
  terms: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: 18,
  },
});
