import React, { useState, useEffect } from 'react';
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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { login, error, clearError } = useAuth();

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

  const handleLogin = async () => {
    if (!isValid) return;
    setLoading(true);
    clearError();
    haptics.medium();

    try {
      await login(email, password);
      haptics.success();
      // Navigation will be handled by RootNavigator when auth state changes
    } catch (err) {
      haptics.error();
      // Error is handled by context
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    haptics.light();
    navigation.goBack();
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
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={contentStyle}>
              <TouchableOpacity
                onPress={handleBack}
                style={styles.backButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name="chevron-left"
                  size={28}
                  color={colors.text}
                />
              </TouchableOpacity>

              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>
                  Welcome back
                </Text>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>
                  Sign in to continue tracking
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
                  placeholder="Your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  showPasswordToggle
                  autoCapitalize="none"
                  autoComplete="current-password"
                />
              </View>

              <View style={styles.spacer} />

              <Button
                title="Sign In"
                onPress={handleLogin}
                disabled={!isValid}
                loading={loading}
              />

              <TouchableOpacity
                onPress={() => {
                  haptics.light();
                  navigation.goBack();
                  navigation.navigate('Onboarding');
                }}
                style={styles.signupLink}
              >
                <Text style={[styles.signupText, { color: colors.textMuted }]}>
                  Don't have an account?{' '}
                  <Text style={{ color: colors.primary }}>Get Started</Text>
                </Text>
              </TouchableOpacity>
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
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxl,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -SPACING.sm,
    marginTop: SPACING.sm,
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
  spacer: {
    flex: 1,
    minHeight: SPACING.xxl,
  },
  signupLink: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  signupText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
});
