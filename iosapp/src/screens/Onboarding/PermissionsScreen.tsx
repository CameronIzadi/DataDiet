import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '../../components/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useOnboarding } from '../../context/OnboardingContext';
import { StepIndicator } from '../../components/StepIndicator';
import { Button } from '../../components/Button';
import { haptics } from '../../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS } from '../../config/designSystem';

interface Props {
  navigation: any;
}

export default function PermissionsScreen({ navigation }: Props) {
  const { colors, gradients } = useTheme();
  const { setField } = useOnboarding();
  const [cameraGranted, setCameraGranted] = useState(false);
  const [checking, setChecking] = useState(true);

  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);
  const iconScale = useSharedValue(0.8);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 500 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 500 }));
    iconScale.value = withDelay(300, withSpring(1, { damping: 12, stiffness: 150 }));
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await ImagePicker.getCameraPermissionsAsync();
    setCameraGranted(status === 'granted');
    setChecking(false);
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const requestCameraPermission = async () => {
    haptics.medium();
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status === 'granted') {
      haptics.success();
      setCameraGranted(true);
      setField('cameraPermissionGranted', true);
    } else if (status === 'denied') {
      haptics.warning();
      Alert.alert(
        'Camera Permission Required',
        'DataDiet needs camera access to capture your meals. Please enable it in Settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  const handleContinue = () => {
    haptics.light();
    navigation.navigate('CreateAccount');
  };

  const handleSkip = () => {
    haptics.light();
    navigation.navigate('CreateAccount');
  };

  return (
    <LinearGradient colors={gradients.hero} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <StepIndicator
          currentStep={4}
          totalSteps={6}
          onBack={() => navigation.goBack()}
        />

        <Animated.View style={[styles.content, contentStyle]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Camera access
            </Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>
              DataDiet uses your camera to capture meals. No photos leave your
              device without your permission.
            </Text>
          </View>

          <View style={styles.illustrationContainer}>
            <Animated.View
              style={[
                styles.illustration,
                { backgroundColor: colors.surface },
                iconStyle,
              ]}
            >
              <Icon
                name="camera"
                size={64}
                color={colors.primary}
              />
            </Animated.View>
          </View>

          <View style={[styles.privacyCard, { backgroundColor: colors.surface }]}>
            <Icon
              name="shield-lock-outline"
              size={24}
              color={colors.primary}
            />
            <View style={styles.privacyText}>
              <Text style={[styles.privacyTitle, { color: colors.text }]}>
                Your privacy matters
              </Text>
              <Text style={[styles.privacyDesc, { color: colors.textMuted }]}>
                Photos are analyzed on-device when possible. Your data is encrypted
                and never sold.
              </Text>
            </View>
          </View>

          <View style={styles.spacer} />

          {cameraGranted ? (
            <View style={styles.grantedContainer}>
              <View style={[styles.grantedBadge, { backgroundColor: `${colors.success}20` }]}>
                <Icon
                  name="check-circle"
                  size={20}
                  color={colors.success}
                />
                <Text style={[styles.grantedText, { color: colors.success }]}>
                  Camera access granted
                </Text>
              </View>
              <Button title="Continue" onPress={handleContinue} />
            </View>
          ) : (
            <View style={styles.buttons}>
              <Button
                title="Enable Camera Access"
                onPress={requestCameraPermission}
              />
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={[styles.skipText, { color: colors.textMuted }]}>
                  Skip for now
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
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
    marginTop: SPACING.xl,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    lineHeight: TYPOGRAPHY.lineHeights.bodyLarge,
    marginTop: SPACING.md,
  },
  illustrationContainer: {
    alignItems: 'center',
    marginTop: SPACING.xxxxl,
  },
  illustration: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyCard: {
    flexDirection: 'row',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.xxxl,
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  privacyText: {
    flex: 1,
  },
  privacyTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  privacyDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: 4,
    lineHeight: 18,
  },
  spacer: {
    flex: 1,
  },
  grantedContainer: {
    gap: SPACING.lg,
  },
  grantedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.pill,
    gap: SPACING.sm,
    alignSelf: 'center',
  },
  grantedText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  buttons: {
    gap: SPACING.md,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  skipText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
});
