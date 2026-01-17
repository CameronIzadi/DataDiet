import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
  route: { params?: { mode?: 'login' | 'signup' } };
}

export default function AuthScreen({ navigation, route }: Props) {
  const initialMode = route.params?.mode || 'signup';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const { colors, gradients } = useTheme();
  const { login, signup, error, clearError } = useAuth();

  const isLogin = mode === 'login';
  const isValid = isLogin
    ? email.length > 0 && password.length >= 6
    : email.length > 0 && password.length >= 6 && name.length > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    clearError();

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name);
        // Navigate to onboarding after signup
        navigation.reset({
          index: 0,
          routes: [{ name: 'OnboardingFlow' }],
        });
      }
    } catch (err) {
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(isLogin ? 'signup' : 'login');
    clearError();
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={[styles.backText, { color: colors.textMuted }]}>
                ← Back
              </Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {isLogin ? 'Welcome back' : 'Create account'}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                {isLogin
                  ? 'Sign in to continue tracking'
                  : 'Start capturing your dietary data'}
              </Text>
            </View>

            {error && (
              <View style={[styles.errorContainer, { backgroundColor: `${colors.error}20` }]}>
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </View>
            )}

            <View style={styles.form}>
              {!isLogin && (
                <Input
                  label="Your name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              )}

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
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </View>

            <View style={styles.actions}>
              <Button
                title={isLogin ? 'Sign In' : 'Create Account'}
                onPress={handleSubmit}
                disabled={!isValid}
                loading={loading}
              />

              <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
                <Text style={[styles.toggleText, { color: colors.textMuted }]}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <Text style={{ color: colors.primary }}>
                    {isLogin ? 'Sign Up' : 'Sign In'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    paddingVertical: SPACING.lg,
  },
  backText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxxl,
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
  actions: {
    marginTop: 'auto',
    gap: SPACING.lg,
  },
  toggleButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  toggleText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
});
