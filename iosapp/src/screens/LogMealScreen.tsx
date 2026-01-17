import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  RefreshControl,
  Modal,
  Dimensions,
  TouchableOpacity,
  Animated as RNAnimated,
  Easing,
  Platform,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import Icon from '../components/Icon';
import { useFocusEffect } from '@react-navigation/native';
import { getMeals } from '../services/meals';
import { Meal } from '../types';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT, GRADIENTS } from '../config/designSystem';
import {
  Card,
  Text as ThemedText,
  SkeletonListItem,
  SkeletonMealDetail,
} from '../components';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

const { height: windowHeight } = Dimensions.get('window');

export default function LogMealScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get tab bar height to properly pad content
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 80;
  }

  // Modal state
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Modal animations
  const sheetHeight = Math.round(windowHeight * 0.75);
  const sheetTranslateY = useRef(new RNAnimated.Value(sheetHeight)).current;
  const backdropOpacity = useRef(new RNAnimated.Value(0)).current;

  const animatedBackground = useAnimatedBackground();

  const openMealModal = useCallback((meal: Meal) => {
    setSelectedMeal(meal);
    sheetTranslateY.setValue(sheetHeight);
    backdropOpacity.setValue(0);
    setIsModalVisible(true);
    haptics.light();

    RNAnimated.parallel([
      RNAnimated.timing(sheetTranslateY, {
        toValue: 0,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      RNAnimated.timing(backdropOpacity, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, [sheetHeight, sheetTranslateY, backdropOpacity]);

  const closeMealModal = useCallback(() => {
    RNAnimated.parallel([
      RNAnimated.timing(sheetTranslateY, {
        toValue: sheetHeight,
        duration: 300,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      RNAnimated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setIsModalVisible(false);
        setSelectedMeal(null);
      }
    });
  }, [sheetHeight, sheetTranslateY, backdropOpacity]);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const userId = user?.uid || 'demo_user';
      const fetchedMeals = await getMeals(userId);
      setMeals(fetchedMeals.slice(0, 10));
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [user?.uid])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMeals();
    setRefreshing(false);
  };

  const handleCapture = () => {
    haptics.light();
    navigation.navigate('Capture');
  };

  const firstName =
    user?.displayName?.split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'there';

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.profileIcon,
                  { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' },
                ]}
              >
                <Icon name="account" size={20} color={colors.textMuted} />
              </View>
              <View>
                <ThemedText variant="bodySmall" color="muted">Hello,</ThemedText>
                <ThemedText variant="headlineSmall" color="primary">{firstName}</ThemedText>
              </View>
            </View>
            <SettingsButton onPress={() => navigation.navigate('Settings')} isDark={isDark} colors={colors} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: tabBarHeight + SPACING.lg }
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <CaptureButton onPress={handleCapture} isDark={isDark} colors={colors} />

          {loading ? (
            <View style={styles.recentSection}>
              <ThemedText variant="bodyLarge" color="primary" style={styles.sectionTitle}>
                Recent Meals
              </ThemedText>
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </View>
          ) : meals.length > 0 ? (
            <View style={styles.recentSection}>
              <ThemedText variant="bodyLarge" color="primary" style={styles.sectionTitle}>
                Recent Meals
              </ThemedText>
              {meals.map((meal, index) => (
                <MealCard
                  key={meal.id}
                  meal={meal}
                  isDark={isDark}
                  colors={colors}
                  onPress={() => openMealModal(meal)}
                  delay={index * 50}
                />
              ))}
            </View>
          ) : (
            <EmptyState isDark={isDark} colors={colors} />
          )}
        </ScrollView>

        {/* Meal Detail Modal */}
        <MealDetailModal
          visible={isModalVisible}
          meal={selectedMeal}
          onClose={closeMealModal}
          sheetHeight={sheetHeight}
          sheetTranslateY={sheetTranslateY}
          backdropOpacity={backdropOpacity}
          colors={colors}
          isDark={isDark}
        />
      </SafeAreaView>
    </Animated.View>
  );
}

interface SettingsButtonProps {
  onPress: () => void;
  isDark: boolean;
  colors: any;
}

function SettingsButton({ onPress, isDark, colors }: SettingsButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={() => {
        haptics.light();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.settingsButton,
        {
          backgroundColor: isDark ? DARK.surface : LIGHT.surface,
          borderWidth: isDark ? 0 : 1,
          borderColor: LIGHT.border,
        },
        animatedStyle,
      ]}
    >
      <Icon name="cog-outline" size={22} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

interface CaptureButtonProps {
  onPress: () => void;
  isDark: boolean;
  colors: any;
}

function CaptureButton({ onPress, isDark, colors }: CaptureButtonProps) {
  const scale = useSharedValue(1);
  const cardGradient = isDark ? GRADIENTS.dark.elevated : GRADIENTS.light.elevated;

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.captureButton,
          {
            borderWidth: isDark ? 0 : 1,
            borderColor: LIGHT.border,
          },
        ]}
      >
        <View style={[styles.captureIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
          <Icon name="camera-plus" size={28} color={colors.text} />
        </View>
        <View style={styles.captureTextContainer}>
          <ThemedText variant="headlineSmall" color="primary">Log a Meal</ThemedText>
          <ThemedText variant="bodySmall" color="muted" style={{ marginTop: 2 }}>
            Take a photo or choose from gallery
          </ThemedText>
        </View>
        <View style={[styles.captureArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
          <Icon name="chevron-right" size={20} color={colors.textMuted} />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface MealCardProps {
  meal: Meal;
  isDark: boolean;
  colors: any;
  delay: number;
  onPress: () => void;
}

function MealCard({ meal, isDark, colors, delay, onPress }: MealCardProps) {
  const scale = useSharedValue(1);
  const cardGradient = isDark ? GRADIENTS.dark.card : GRADIENTS.light.card;
  const isPending = meal.status === 'pending';
  const isFailed = meal.status === 'failed';

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get primary food name or combine if multiple
  const primaryFood = meal.foods.length > 0
    ? meal.foods[0].name
    : isPending ? 'Analyzing...' : isFailed ? 'Analysis Failed' : 'Meal';
  const foodCount = meal.foods.length;
  const displayName = foodCount > 1
    ? `${primaryFood} +${foodCount - 1}`
    : primaryFood;

  const mealTime = new Date(meal.loggedAt);
  const timeString = mealTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  // Flag emoji and label mapping
  const getFlagInfo = (flag: string) => {
    switch (flag) {
      case 'plastic': return { emoji: '🧴', label: 'Plastic' };
      case 'processed_meat': return { emoji: '🥓', label: 'Processed Meat' };
      case 'late_meal': return { emoji: '🌙', label: 'Late Meal' };
      case 'high_sodium': return { emoji: '🧂', label: 'High Sodium' };
      case 'fried': return { emoji: '🍳', label: 'Fried' };
      case 'ultra_processed': return { emoji: '📦', label: 'Ultra Processed' };
      case 'caffeine': return { emoji: '☕', label: 'Caffeine' };
      case 'alcohol': return { emoji: '🍷', label: 'Alcohol' };
      case 'high_sugar_beverage': return { emoji: '🥤', label: 'Sugary Drink' };
      case 'refined_grain': return { emoji: '🍞', label: 'Refined Grain' };
      case 'charred_grilled': return { emoji: '🔥', label: 'Charred' };
      default: return { emoji: '⚠️', label: flag.replace(/_/g, ' ') };
    }
  };

  const hasFlags = meal.flags && meal.flags.length > 0;

  return (
    <AnimatedPressable
      entering={FadeIn.delay(delay).duration(300)}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.mealCard,
          {
            borderWidth: isDark ? 0 : 1,
            borderColor: LIGHT.border,
          },
        ]}
      >
        {/* Thumbnail */}
        {meal.imageUrl ? (
          <Image
            source={{ uri: meal.imageUrl }}
            style={styles.mealThumbnail}
          />
        ) : (
          <View style={[styles.mealThumbnailPlaceholder, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }]}>
            <Icon name="food" size={28} color={colors.textMuted} />
          </View>
        )}

        {/* Content */}
        <View style={styles.mealContent}>
          {/* Header row: Food name + Time */}
          <View style={styles.mealHeader}>
            <View style={styles.mealTitleRow}>
              <ThemedText variant="bodyLarge" color="primary" numberOfLines={1} style={styles.mealTitle}>
                {displayName}
              </ThemedText>
              {isPending && (
                <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
                  <ThemedText variant="labelSmall" style={{ color: colors.primary }}>
                    Analyzing...
                  </ThemedText>
                </View>
              )}
              {isFailed && (
                <View style={[styles.statusBadge, { backgroundColor: colors.error + '20' }]}>
                  <ThemedText variant="labelSmall" style={{ color: colors.error }}>
                    Failed
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText variant="labelSmall" color="soft">
              {timeString}
            </ThemedText>
          </View>

          {/* Flags row - the main content (dietary signals) */}
          {hasFlags ? (
            <View style={styles.flagsRow}>
              {meal.flags.slice(0, 3).map((flag, i) => {
                const flagInfo = getFlagInfo(flag);
                return (
                  <View
                    key={i}
                    style={[
                      styles.flagPill,
                      { backgroundColor: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)' }
                    ]}
                  >
                    <ThemedText style={styles.flagEmoji}>{flagInfo.emoji}</ThemedText>
                    <ThemedText variant="labelSmall" style={{ color: isDark ? '#FCA5A5' : '#DC2626' }}>
                      {flagInfo.label}
                    </ThemedText>
                  </View>
                );
              })}
              {meal.flags.length > 3 && (
                <ThemedText variant="labelSmall" color="soft" style={{ marginLeft: SPACING.xs }}>
                  +{meal.flags.length - 3}
                </ThemedText>
              )}
            </View>
          ) : !isPending && (
            <View style={styles.flagsRow}>
              <View style={[styles.flagPill, { backgroundColor: isDark ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)' }]}>
                <ThemedText style={styles.flagEmoji}>✓</ThemedText>
                <ThemedText variant="labelSmall" style={{ color: isDark ? '#86EFAC' : '#16A34A' }}>
                  No flags
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Chevron */}
        <View style={styles.mealChevron}>
          <Icon name="chevron-right" size={20} color={isDark ? DARK.textSoft : LIGHT.textSoft} />
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface EmptyStateProps {
  isDark: boolean;
  colors: any;
}

function EmptyState({ isDark, colors }: EmptyStateProps) {
  return (
    <Card variant="secondary" style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
        <Icon name="food-apple-outline" size={48} color={colors.primary} />
      </View>
      <ThemedText variant="headlineSmall" color="primary" style={styles.emptyTitle}>
        No meals logged yet
      </ThemedText>
      <ThemedText variant="bodyMedium" color="muted" style={styles.emptyDesc}>
        Start by capturing your first meal above
      </ThemedText>
    </Card>
  );
}

interface MealDetailModalProps {
  visible: boolean;
  meal: Meal | null;
  onClose: () => void;
  sheetHeight: number;
  sheetTranslateY: RNAnimated.Value;
  backdropOpacity: RNAnimated.Value;
  colors: any;
  isDark: boolean;
}

function MealDetailModal({
  visible,
  meal,
  onClose,
  sheetHeight,
  sheetTranslateY,
  backdropOpacity,
  colors,
  isDark,
}: MealDetailModalProps) {
  // Create pan responder for swipe-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes
        return gestureState.dy > 10;
      },
      onPanResponderMove: (_, gestureState) => {
        // Only allow downward movement
        if (gestureState.dy > 0) {
          sheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // If swiped down more than 100px or velocity is high, close
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          onClose();
        } else {
          // Snap back to open position
          RNAnimated.spring(sheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 10,
          }).start();
        }
      },
    })
  ).current;

  if (!meal) return null;

  // Get primary food name
  const primaryFood = meal.foods.length > 0 ? meal.foods[0].name : 'Meal';
  const foodCount = meal.foods.length;
  const displayName = foodCount > 1 ? `${primaryFood} +${foodCount - 1}` : primaryFood;

  const mealTime = new Date(meal.loggedAt);
  const dateString = mealTime.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const timeString = mealTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  const hasFlags = meal.flags && meal.flags.length > 0;

  // Flag info mapping
  const getFlagInfo = (flag: string) => {
    switch (flag) {
      case 'plastic': return { emoji: '🧴', label: 'Plastic Container', desc: 'Potential microplastics/BPA exposure' };
      case 'processed_meat': return { emoji: '🥓', label: 'Processed Meat', desc: 'WHO Group 1 carcinogen' };
      case 'late_meal': return { emoji: '🌙', label: 'Late Meal', desc: 'Eating after 9pm affects sleep & metabolism' };
      case 'high_sodium': return { emoji: '🧂', label: 'High Sodium', desc: 'May contribute to high blood pressure' };
      case 'fried': return { emoji: '🍳', label: 'Fried Food', desc: 'High in trans fats and inflammatory compounds' };
      case 'ultra_processed': return { emoji: '📦', label: 'Ultra Processed', desc: 'Linked to obesity and chronic disease' };
      case 'caffeine': return { emoji: '☕', label: 'Caffeine', desc: 'May affect sleep if consumed late' };
      case 'alcohol': return { emoji: '🍷', label: 'Alcohol', desc: 'Impacts liver, sleep, and calories' };
      case 'high_sugar_beverage': return { emoji: '🥤', label: 'Sugary Drink', desc: 'Blood sugar spike, empty calories' };
      case 'refined_grain': return { emoji: '🍞', label: 'Refined Grain', desc: 'Low fiber, rapid blood sugar impact' };
      case 'charred_grilled': return { emoji: '🔥', label: 'Charred/Grilled', desc: 'May contain carcinogenic compounds' };
      default: return { emoji: '⚠️', label: flag.replace(/_/g, ' '), desc: '' };
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <RNAnimated.View
          style={[
            styles.modalBackdrop,
            { opacity: backdropOpacity },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
          />
        </RNAnimated.View>

        {/* Sheet */}
        <RNAnimated.View
          style={[
            styles.modalSheet,
            {
              height: sheetHeight,
              transform: [{ translateY: sheetTranslateY }],
              backgroundColor: isDark ? DARK.surface : LIGHT.surface,
            },
          ]}
        >
          {/* Swipeable Handle Area */}
          <View {...panResponder.panHandlers} style={styles.modalHandleArea}>
            <View style={[styles.modalHandleBar, { backgroundColor: isDark ? DARK.border : LIGHT.border }]} />
            <ThemedText variant="labelSmall" color="soft" style={{ marginTop: SPACING.xs }}>
              Swipe down to close
            </ThemedText>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Image */}
            {meal.imageUrl ? (
              <Image
                source={{ uri: meal.imageUrl }}
                style={styles.modalHeroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.modalHeroImagePlaceholder, { backgroundColor: `${colors.primary}10` }]}>
                <Icon name="food" size={64} color={colors.primary} />
              </View>
            )}

            {/* Title & Time */}
            <View style={styles.modalTitleSection}>
              <ThemedText variant="headlineLarge" color="primary">
                {displayName}
              </ThemedText>
              <ThemedText variant="bodyMedium" color="muted" style={{ marginTop: SPACING.xs }}>
                {dateString} at {timeString}
              </ThemedText>
            </View>

            {/* DIETARY SIGNALS - Primary Focus */}
            <View style={styles.modalSignalsSection}>
              <ThemedText variant="headlineSmall" color="primary" style={styles.modalSectionTitle}>
                Dietary Signals
              </ThemedText>

              {hasFlags ? (
                <View style={styles.modalSignalsContainer}>
                  {meal.flags.map((flag, i) => {
                    const flagInfo = getFlagInfo(flag);
                    return (
                      <View
                        key={i}
                        style={[
                          styles.modalSignalCard,
                          { backgroundColor: isDark ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.08)' }
                        ]}
                      >
                        <View style={styles.modalSignalHeader}>
                          <ThemedText style={styles.modalSignalEmoji}>{flagInfo.emoji}</ThemedText>
                          <ThemedText variant="bodyLarge" style={{ color: isDark ? '#FCA5A5' : '#DC2626', fontFamily: TYPOGRAPHY.fontFamily.semiBold }}>
                            {flagInfo.label}
                          </ThemedText>
                        </View>
                        {flagInfo.desc && (
                          <ThemedText variant="bodySmall" color="muted" style={{ marginTop: SPACING.xs }}>
                            {flagInfo.desc}
                          </ThemedText>
                        )}
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.modalNoFlagsCard, { backgroundColor: isDark ? 'rgba(34,197,94,0.1)' : 'rgba(34,197,94,0.08)' }]}>
                  <ThemedText style={{ fontSize: 32 }}>✓</ThemedText>
                  <View style={{ marginLeft: SPACING.md }}>
                    <ThemedText variant="bodyLarge" style={{ color: isDark ? '#86EFAC' : '#16A34A', fontFamily: TYPOGRAPHY.fontFamily.semiBold }}>
                      No dietary flags detected
                    </ThemedText>
                    <ThemedText variant="bodySmall" color="muted" style={{ marginTop: SPACING.xs }}>
                      This meal doesn't contain tracked risk factors
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>

            {/* Foods Detected */}
            {meal.foods.length > 0 && (
              <View style={styles.modalFoodsSection}>
                <ThemedText variant="bodyLarge" color="primary" style={styles.modalSectionTitle}>
                  Foods Detected
                </ThemedText>
                <View style={styles.modalFoodsList}>
                  {meal.foods.map((food, index) => (
                    <View key={index} style={styles.modalFoodRow}>
                      <ThemedText variant="bodyMedium" color="primary">
                        {food.name}
                      </ThemedText>
                      {food.portion && (
                        <ThemedText variant="bodySmall" color="soft">
                          {food.portion}
                        </ThemedText>
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </RNAnimated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  captureButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xxl,
    marginBottom: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  captureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  captureTextContainer: {
    flex: 1,
  },
  captureArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentSection: {
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    marginBottom: SPACING.sm,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  mealThumbnail: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.xl,
    marginRight: SPACING.md,
  },
  mealThumbnailPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  mealContent: {
    flex: 1,
    justifyContent: 'center',
    gap: SPACING.xs,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitle: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  mealChevron: {
    marginLeft: SPACING.sm,
  },
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  flagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  flagEmoji: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
    marginTop: SPACING.xl,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  emptyTitle: {
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyDesc: {
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    overflow: 'hidden',
  },
  modalHandleArea: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  modalHandleBar: {
    width: 48,
    height: 5,
    borderRadius: 3,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxxl,
  },
  modalHeroImage: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
  },
  modalHeroImagePlaceholder: {
    width: '100%',
    height: 220,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleSection: {
    marginBottom: SPACING.xl,
  },
  modalSignalsSection: {
    marginBottom: SPACING.xl,
  },
  modalSectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    marginBottom: SPACING.md,
  },
  modalSignalsContainer: {
    gap: SPACING.sm,
  },
  modalSignalCard: {
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
  },
  modalSignalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  modalSignalEmoji: {
    fontSize: 24,
  },
  modalNoFlagsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
  },
  modalFoodsSection: {
    marginBottom: SPACING.xl,
  },
  modalFoodsList: {
    gap: SPACING.sm,
  },
  modalFoodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
});
