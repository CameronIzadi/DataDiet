import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  interpolateColor,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import Icon from '../components/Icon';
import { analyzeFood } from '../services/gemini';
import { savePendingMeal, updateMealWithAnalysis, markMealFailed } from '../services/meals';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT } from '../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

export default function CaptureScreen({ navigation }: Props) {
  const { colors, themeProgress } = useTheme();
  const { user } = useAuth();
  const [success, setSuccess] = useState(false);

  // Animated background
  const animatedBackground = useAnimatedBackground();

  // Entrance animations
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const pickImage = async () => {
    haptics.light();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await processImage(result.assets[0].base64);
    }
  };

  const takePhoto = async () => {
    haptics.light();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to take photos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      await processImage(result.assets[0].base64);
    }
  };

  const processImage = async (base64: string) => {
    const userId = user?.uid || 'demo_user';

    // Show success immediately - no waiting
    setSuccess(true);
    haptics.success();

    successOpacity.value = withTiming(1, { duration: 300 });
    successScale.value = withSequence(
      withSpring(1.2, { damping: 10, stiffness: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );

    // Fire off save + analysis in background (don't await)
    saveAndAnalyzeMeal(userId, base64);
  };

  // Background function - runs async after user sees success
  const saveAndAnalyzeMeal = async (userId: string, base64: string) => {
    let mealId: string | null = null;
    try {
      mealId = await savePendingMeal(userId, base64);
      console.log('Meal saved with ID:', mealId);

      // Now analyze
      const analysis = await analyzeFood(base64);

      // Add late_meal flag if needed
      const hour = new Date().getHours();
      if ((hour >= 21 || hour < 5) && !analysis.flags.includes('late_meal')) {
        analysis.flags.push('late_meal');
      }

      await updateMealWithAnalysis(
        userId,
        mealId,
        analysis.foods,
        analysis.flags,
        analysis.estimated_nutrition
      );

      console.log('Meal analysis complete:', mealId);
    } catch (error: any) {
      console.error('Error in background save/analysis:', error);
      // Mark meal as failed if we have a mealId
      if (mealId) {
        await markMealFailed(userId, mealId, error?.message || 'Unknown error');
      }
    }
  };


  const successAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successOpacity.value,
  }));

  const successTextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  const successSubtextStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  const handleDismiss = () => {
    haptics.light();
    navigation.goBack();
  };

  if (success) {
    return (
      <Animated.View style={[styles.container, animatedBackground]}>
        <SafeAreaView style={styles.safe}>
          <View style={styles.successContainer}>
            <Animated.View
              style={[
                styles.successCircle,
                { backgroundColor: `${colors.success}20` },
                successAnimStyle,
              ]}
            >
              <Icon name="check" size={48} color={colors.success} />
            </Animated.View>
            <Animated.Text style={[styles.successText, successTextStyle]}>
              Congrats!
            </Animated.Text>
            <Animated.Text style={[styles.successSubtext, successSubtextStyle]}>
              See you next meal!
            </Animated.Text>
            <AnimatedPressable
              onPress={handleDismiss}
              style={[styles.okButton, { backgroundColor: colors.success }]}
            >
              <Text style={styles.okButtonText}>OK</Text>
            </AnimatedPressable>
          </View>
        </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Log Meal" onBack={() => navigation.goBack()} />

        <Animated.View style={[styles.optionsContainer, contentStyle]}>
          <AnimatedInstruction themeProgress={themeProgress} />
          <AnimatedSubInstruction themeProgress={themeProgress} />

          <View style={styles.options}>
            <OptionCard
              icon="camera"
              title="Take Photo"
              description="Use your camera"
              onPress={takePhoto}
              themeProgress={themeProgress}
              colors={colors}
              delay={200}
            />

            <OptionCard
              icon="image-multiple"
              title="Choose from Gallery"
              description="Select an existing photo"
              onPress={pickImage}
              themeProgress={themeProgress}
              colors={colors}
              delay={300}
            />
          </View>
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

function AnimatedInstruction({ themeProgress }: { themeProgress: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  return (
    <Animated.Text style={[styles.instruction, animatedStyle]}>
      Capture your meal
    </Animated.Text>
  );
}

function AnimatedSubInstruction({ themeProgress }: { themeProgress: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <Animated.Text style={[styles.subInstruction, animatedStyle]}>
      We'll remember so you don't have to
    </Animated.Text>
  );
}

interface OptionCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
  delay: number;
}

function OptionCard({ icon, title, description, onPress, themeProgress, colors, delay }: OptionCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400 }));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.surface, DARK.surface]
    ),
    borderColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.border, DARK.border]
    ),
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  const descStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.optionCard, animatedStyle]}
    >
      <View style={[styles.optionIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <Icon name={icon as any} size={28} color={colors.primary} />
      </View>
      <View style={styles.optionTextContainer}>
        <Animated.Text style={[styles.optionTitle, titleStyle]}>{title}</Animated.Text>
        <Animated.Text style={[styles.optionDesc, descStyle]}>
          {description}
        </Animated.Text>
      </View>
      <Icon name="chevron-right" size={24} color={colors.textMuted} />
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
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
  },
  instruction: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subInstruction: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    textAlign: 'center',
    marginBottom: SPACING.xxxxl,
  },
  options: {
    gap: SPACING.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.md,
  },
  optionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
  },
  optionDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: 2,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xxl,
  },
  successText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.headlineLarge,
    marginBottom: SPACING.sm,
  },
  successSubtext: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
  },
  okButton: {
    marginTop: SPACING.xxxl,
    paddingHorizontal: SPACING.xxxxl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
  },
  okButtonText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    color: '#fff',
  },
});
