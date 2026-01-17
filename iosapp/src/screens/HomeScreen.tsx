import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  FadeIn,
  interpolateColor,
} from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import Icon from '../components/Icon';
import { Meal } from '../types';
import { getRecentMeals } from '../services/meals';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT } from '../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

export default function HomeScreen({ navigation }: Props) {
  const { colors, themeProgress } = useTheme();
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Animated background
  const animatedBackground = useAnimatedBackground();

  // Entrance animations
  const headerOpacity = useSharedValue(0);
  const headerTranslate = useSharedValue(-20);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslate = useSharedValue(20);
  const listOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    headerTranslate.value = withDelay(100, withTiming(0, { duration: 400 }));
    buttonsOpacity.value = withDelay(200, withTiming(1, { duration: 400 }));
    buttonsTranslate.value = withDelay(200, withTiming(0, { duration: 400 }));
    listOpacity.value = withDelay(300, withTiming(1, { duration: 400 }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslate.value }],
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslate.value }],
  }));

  const listStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
  }));

  const loadMeals = async () => {
    try {
      const userId = user?.uid || 'demo_user';
      const recentMeals = await getRecentMeals(userId, 10);
      setMeals(recentMeals);
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [user?.uid])
  );

  const onRefresh = () => {
    haptics.light();
    setRefreshing(true);
    loadMeals();
  };

  const handleCapture = () => {
    haptics.medium();
    navigation.navigate('Capture');
  };

  const handleInsights = () => {
    haptics.light();
    navigation.navigate('Insights');
  };

  const handleReport = () => {
    haptics.light();
    navigation.navigate('Report');
  };

  const handleSettings = () => {
    haptics.light();
    navigation.navigate('Settings');
  };

  const firstName = user?.displayName?.split(' ')[0] || 'there';

  const renderMealItem = ({ item, index }: { item: Meal; index: number }) => (
    <MealCard meal={item} themeProgress={themeProgress} colors={colors} index={index} />
  );

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <AnimatedGreeting themeProgress={themeProgress} />
            <AnimatedName firstName={firstName} themeProgress={themeProgress} />
          </View>
          <ProfileButton themeProgress={themeProgress} colors={colors} onPress={handleSettings} />
        </Animated.View>

        <Animated.View style={[styles.actionButtons, buttonsStyle]}>
          <ActionButton
            icon="camera"
            label="Log Meal"
            onPress={handleCapture}
            themeProgress={themeProgress}
            colors={colors}
            isPrimary
          />
          <ActionButton
            icon="chart-line"
            label="Insights"
            onPress={handleInsights}
            themeProgress={themeProgress}
            colors={colors}
          />
          <ActionButton
            icon="file-document-outline"
            label="Report"
            onPress={handleReport}
            themeProgress={themeProgress}
            colors={colors}
          />
        </Animated.View>

        <Animated.View style={[styles.recentSection, listStyle]}>
          <AnimatedSectionTitle themeProgress={themeProgress} />

          {loading ? (
            <View style={styles.loadingContainer}>
              <Animated.View entering={FadeIn.duration(300)}>
                <AnimatedLoadingText themeProgress={themeProgress} />
              </Animated.View>
            </View>
          ) : meals.length === 0 ? (
            <EmptyState themeProgress={themeProgress} colors={colors} />
          ) : (
            <FlatList
              data={meals}
              renderItem={renderMealItem}
              keyExtractor={item => item.id}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                />
              }
              contentContainerStyle={styles.listContent}
            />
          )}
        </Animated.View>
      </SafeAreaView>
    </Animated.View>
  );
}

// Animated greeting text
function AnimatedGreeting({ themeProgress }: { themeProgress: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <Animated.Text style={[styles.greeting, animatedStyle]}>
      Welcome back,
    </Animated.Text>
  );
}

// Animated name
function AnimatedName({ firstName, themeProgress }: { firstName: string; themeProgress: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  return (
    <Animated.Text style={[styles.name, animatedStyle]}>
      {firstName}
    </Animated.Text>
  );
}

// Animated section title
function AnimatedSectionTitle({ themeProgress }: { themeProgress: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  return (
    <Animated.Text style={[styles.sectionTitle, animatedStyle]}>
      Recent Meals
    </Animated.Text>
  );
}

// Animated loading text
function AnimatedLoadingText({ themeProgress }: { themeProgress: Animated.SharedValue<number> }) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <Animated.Text style={[styles.loadingText, animatedStyle]}>
      Loading...
    </Animated.Text>
  );
}

interface ProfileButtonProps {
  themeProgress: Animated.SharedValue<number>;
  colors: any;
  onPress: () => void;
}

function ProfileButton({ themeProgress, colors, onPress }: ProfileButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.surface, DARK.surface]
    ),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.profileButton, animatedStyle]}
    >
      <Icon name="account" size={22} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
  isPrimary?: boolean;
}

function ActionButton({ icon, label, onPress, themeProgress, colors, isPrimary }: ActionButtonProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    if (isPrimary) {
      return {
        transform: [{ scale: scale.value }],
        backgroundColor: colors.primary,
        flex: 1.5,
      };
    }
    return {
      transform: [{ scale: scale.value }],
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
      borderWidth: 1,
      flex: 1,
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    if (isPrimary) {
      return { color: '#FFFFFF' };
    }
    return {
      color: interpolateColor(
        themeProgress.value,
        [0, 1],
        [LIGHT.text, DARK.text]
      ),
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.actionButton, animatedStyle]}
    >
      <Icon
        name={icon as any}
        size={20}
        color={isPrimary ? '#FFFFFF' : colors.text}
        style={styles.actionIcon}
      />
      <Animated.Text style={[styles.actionLabel, labelStyle]}>
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

interface MealCardProps {
  meal: Meal;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
  index: number;
}

function MealCard({ meal, themeProgress, colors, index }: MealCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    const delay = index * 50;
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 300 }));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
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

  const timeStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  const foodsStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  const flags = meal.flags || [];

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.mealCard, animatedStyle]}
    >
      <View style={styles.mealHeader}>
        <Animated.Text style={[styles.mealTime, timeStyle]}>
          {new Date(meal.loggedAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
          {new Date(meal.loggedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Animated.Text>
        <View style={styles.flagsContainer}>
          {flags.includes('plastic_bottle') && <Text style={styles.flag}>🥤</Text>}
          {flags.includes('processed_meat') && <Text style={styles.flag}>🥓</Text>}
          {flags.includes('late_meal') && <Text style={styles.flag}>🌙</Text>}
        </View>
      </View>
      <Animated.Text style={[styles.mealFoods, foodsStyle]} numberOfLines={2}>
        {meal.foods.map(f => f.name).join(', ')}
      </Animated.Text>
    </AnimatedPressable>
  );
}

interface EmptyStateProps {
  themeProgress: Animated.SharedValue<number>;
  colors: any;
}

function EmptyState({ themeProgress, colors }: EmptyStateProps) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 400 });
    scale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <Animated.View style={[styles.emptyState, animatedStyle]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <Icon name="food-outline" size={40} color={colors.primary} />
      </View>
      <Animated.Text style={[styles.emptyText, titleStyle]}>
        No meals logged yet
      </Animated.Text>
      <Animated.Text style={[styles.emptySubtext, subtitleStyle]}>
        Tap "Log Meal" to get started
      </Animated.Text>
    </Animated.View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  greeting: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  name: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: TYPOGRAPHY.sizes.displaySmall,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xxl,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.xs,
  },
  actionIcon: {
    marginRight: 2,
  },
  actionLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
  },
  recentSection: {
    flex: 1,
    paddingHorizontal: SPACING.xxl,
    paddingTop: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.headlineSmall,
    marginBottom: SPACING.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  listContent: {
    paddingBottom: SPACING.xxl,
  },
  mealCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  mealTime: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
  },
  flagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  flag: {
    fontSize: 14,
  },
  mealFoods: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
    lineHeight: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.headlineSmall,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
});
