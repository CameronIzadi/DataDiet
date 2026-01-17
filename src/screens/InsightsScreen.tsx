import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated as RNAnimated,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Icon from '../components/Icon';
import { Insights, Meal } from '../types';
import { getMeals } from '../services/meals';
import { calculateInsights } from '../services/insights';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useOnboarding, TrackingSignal, TRACKING_SIGNALS } from '../context/OnboardingContext';
import { haptics } from '../utils/haptics';
import {
  SPACING,
  TYPOGRAPHY,
  RADIUS,
  DARK,
  LIGHT,
} from '../config/designSystem';
import Card from '../components/Card';
import Text from '../components/Text';
import { SkeletonHeroCard, SkeletonInsightCard } from '../components/Skeleton';
import { MiniTrendLine } from '../components/charts';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const RNAnimatedPressable = RNAnimated.createAnimatedComponent(Pressable);

// PressableScale component
type PressableScaleProps = {
  onPress: () => void;
  children: React.ReactNode;
  style?: any;
  disabled?: boolean;
};

const PressableScale = ({ onPress, children, style, disabled }: PressableScaleProps) => {
  const scale = useRef(new RNAnimated.Value(1)).current;

  useEffect(() => {
    if (disabled) {
      scale.setValue(1);
    }
  }, [disabled, scale]);

  const handlePressIn = () => {
    if (disabled) return;
    RNAnimated.spring(scale, {
      toValue: 0.96,
      speed: 40,
      bounciness: 0,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    RNAnimated.spring(scale, {
      toValue: 1,
      speed: 30,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <RNAnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[style, { transform: [{ scale }] }]}
    >
      {children}
    </RNAnimatedPressable>
  );
};

// Time period configuration
type TimeRangeKey = '7d' | '30d' | '90d' | '180d' | '365d';

const TIME_RANGES: { key: TimeRangeKey; label: string; days: number }[] = [
  { key: '7d', label: 'Week', days: 7 },
  { key: '30d', label: '1M', days: 30 },
  { key: '90d', label: '3M', days: 90 },
  { key: '180d', label: '6M', days: 180 },
  { key: '365d', label: '1Y', days: 365 },
];

interface Props {
  navigation: any;
}

// Signal card configuration
interface SignalCardConfig {
  signal: TrackingSignal;
  icon: string;
  title: string;
  getValue: (insights: Insights) => string;
  getSubtitle: (insights: Insights) => string;
  getContext: () => string;
  getConcernLevel: (insights: Insights) => 'low' | 'moderate' | 'elevated';
  getExtraInfo?: (insights: Insights) => string | null;
  getChartData?: (insights: Insights) => number[];
}

const SIGNAL_CARDS: SignalCardConfig[] = [
  {
    signal: 'plastic_bottle',
    icon: 'bottle-soda',
    title: 'Plastic Exposure',
    getValue: (i) => `${i.plastic.count}`,
    getSubtitle: (i) => `bottles (${i.plastic.perDay?.toFixed(1)}/day)`,
    getContext: () => 'Bottled water adds ~90,000 microplastics/year.',
    getConcernLevel: (i) => i.plastic.concernLevel,
  },
  {
    signal: 'plastic_container_hot',
    icon: 'pot-steam',
    title: 'Hot Food in Plastic',
    getValue: (i) => `${i.plasticHot.count}`,
    getSubtitle: (i) => `times (${i.plasticHot.perDay?.toFixed(1)}/day)`,
    getContext: () => 'Heat increases plastic leaching into food.',
    getConcernLevel: (i) => i.plasticHot.concernLevel,
  },
  {
    signal: 'processed_meat',
    icon: 'food-steak',
    title: 'Processed Meat',
    getValue: (i) => `${i.processedMeat.perWeek?.toFixed(1)}`,
    getSubtitle: () => 'servings per week',
    getContext: () => 'WHO Group 1 carcinogen. Limit to <3/week.',
    getConcernLevel: (i) => i.processedMeat.concernLevel,
  },
  {
    signal: 'charred_grilled',
    icon: 'grill',
    title: 'Charred/Grilled',
    getValue: (i) => `${i.charredGrilled.perWeek?.toFixed(1)}`,
    getSubtitle: () => 'times per week',
    getContext: () => 'Creates HCAs and PAHs linked to cancer.',
    getConcernLevel: (i) => i.charredGrilled.concernLevel,
  },
  {
    signal: 'ultra_processed',
    icon: 'package-variant',
    title: 'Ultra-Processed',
    getValue: (i) => `${i.ultraProcessed.percent}%`,
    getSubtitle: () => 'of your meals',
    getContext: () => 'Average American: 55%. Aim for <30%.',
    getConcernLevel: (i) => i.ultraProcessed.concernLevel,
  },
  {
    signal: 'high_sugar_beverage',
    icon: 'cup',
    title: 'Sugary Drinks',
    getValue: (i) => `${i.highSugarBeverage.count}`,
    getSubtitle: (i) => `drinks (${i.highSugarBeverage.perDay?.toFixed(1)}/day)`,
    getContext: () => 'Highest mortality risk among ultra-processed.',
    getConcernLevel: (i) => i.highSugarBeverage.concernLevel,
  },
  {
    signal: 'caffeine',
    icon: 'coffee',
    title: 'Caffeine',
    getValue: (i) => `${i.caffeine.count}`,
    getSubtitle: (i) => `drinks (${i.caffeine.perDay?.toFixed(1)}/day)`,
    getContext: () => 'FDA: max ~4 cups/day. Avoid after 2pm.',
    getConcernLevel: (i) => i.caffeine.concernLevel,
    getExtraInfo: (i) => i.caffeine.lateCount > 0 ? `${i.caffeine.lateCount} after 2pm` : null,
  },
  {
    signal: 'alcohol',
    icon: 'glass-wine',
    title: 'Alcohol',
    getValue: (i) => `${i.alcohol.perWeek?.toFixed(1)}`,
    getSubtitle: () => 'drinks per week',
    getContext: () => 'CDC: 1/day women, 2/day men max.',
    getConcernLevel: (i) => i.alcohol.concernLevel,
  },
  {
    signal: 'fried_food',
    icon: 'french-fries',
    title: 'Fried Foods',
    getValue: (i) => `${i.friedFood.perWeek?.toFixed(1)}`,
    getSubtitle: () => 'times per week',
    getContext: () => 'Linked to heart disease. Bake or grill instead.',
    getConcernLevel: (i) => i.friedFood.concernLevel,
  },
  {
    signal: 'refined_grain',
    icon: 'bread-slice',
    title: 'Refined Grains',
    getValue: (i) => `${i.refinedGrain.percent}%`,
    getSubtitle: () => 'of your meals',
    getContext: () => 'Choose whole grains when possible.',
    getConcernLevel: (i) => i.refinedGrain.concernLevel,
  },
  {
    signal: 'high_sodium',
    icon: 'shaker',
    title: 'High Sodium',
    getValue: (i) => `${i.highSodium.count}`,
    getSubtitle: (i) => `meals (${i.highSodium.perDay?.toFixed(1)}/day)`,
    getContext: () => 'FDA: <2,300mg/day. Average: 3,400mg.',
    getConcernLevel: (i) => i.highSodium.concernLevel,
  },
  {
    signal: 'spicy_irritant',
    icon: 'chili-hot',
    title: 'Spicy Foods',
    getValue: (i) => `${i.spicyIrritant.perWeek?.toFixed(1)}`,
    getSubtitle: () => 'times per week',
    getContext: () => 'Track if you have IBS or gut sensitivity.',
    getConcernLevel: (i) => i.spicyIrritant.concernLevel,
  },
  {
    signal: 'acidic_trigger',
    icon: 'fruit-citrus',
    title: 'Acidic Foods',
    getValue: (i) => `${i.acidicTrigger.perWeek?.toFixed(1)}`,
    getSubtitle: () => 'times per week',
    getContext: () => 'May trigger reflux symptoms.',
    getConcernLevel: (i) => i.acidicTrigger.concernLevel,
  },
  {
    signal: 'late_meal',
    icon: 'weather-night',
    title: 'Late Meals',
    getValue: (i) => `${i.lateMeal.percent}%`,
    getSubtitle: () => 'after 9pm',
    getContext: () => '2-3x obesity risk. Eat 3+ hrs before bed.',
    getConcernLevel: (i) => i.lateMeal.concernLevel,
    getExtraInfo: (i) => i.lateMeal.avgDinnerTime !== 'N/A' ? `Avg dinner: ${i.lateMeal.avgDinnerTime}` : null,
  },
];

const DAY_MS = 24 * 60 * 60 * 1000;

function getLast7DaysRange() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(end.getDate() - 6);
  start.setHours(0, 0, 0, 0);
  return { start, end };
}

function getLast7DaySeries(meals: Meal[]): number[] {
  const { start, end } = getLast7DaysRange();
  const series = Array(7).fill(0);
  meals.forEach(meal => {
    const date = new Date(meal.loggedAt);
    if (date < start || date > end) return;
    const index = Math.floor((date.getTime() - start.getTime()) / DAY_MS);
    if (index < 0 || index > 6) return;
    series[index] += 1;
  });
  return series;
}

export default function InsightsScreen({ navigation }: Props) {
  const { colors, gradients, isDark } = useTheme();
  const { user } = useAuth();
  const { data: onboardingData } = useOnboarding();
  const [insights, setInsights] = useState<Insights | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('30d');

  // Get tab bar height for proper padding
  let tabBarHeight = 0;
  try {
    tabBarHeight = useBottomTabBarHeight();
  } catch {
    tabBarHeight = 80;
  }

  const animatedBackground = useAnimatedBackground();
  const contentOpacity = useSharedValue(0);

  // Get active signals based on user's onboarding selection
  const getActiveSignals = (): TrackingSignal[] => {
    if (onboardingData.trackEverything || onboardingData.trackingSignals.length === 0) {
      return TRACKING_SIGNALS.map(s => s.id);
    }
    return onboardingData.trackingSignals;
  };

  useEffect(() => {
    loadInsights();
  }, [timeRange]);

  const loadInsights = async () => {
    if (!refreshing) setLoading(true);
    try {
      const userId = user?.uid || 'demo_user';
      const selectedRange = TIME_RANGES.find(r => r.key === timeRange);
      const days = selectedRange?.days || 30;

      let endDate: Date;
      let startDate: Date;

      if (timeRange === '7d') {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = (dayOfWeek + 6) % 7;
        startDate = new Date(now);
        startDate.setDate(now.getDate() - mondayOffset);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
      }

      const fetchedMeals = await getMeals(userId, startDate, endDate, 5000);
      const calculatedInsights = calculateInsights(fetchedMeals);
      setMeals(fetchedMeals);
      setInsights(calculatedInsights);
      contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInsights();
  };

  const handleTimeRangeChange = (range: TimeRangeKey) => {
    if (range === timeRange) return;
    haptics.light();
    setTimeRange(range);
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Get cards to display based on user's selected signals
  const activeSignals = getActiveSignals();
  const cardsToShow = SIGNAL_CARDS.filter(card => activeSignals.includes(card.signal));
  const last7DaySeries = getLast7DaySeries(meals);

  // Loading state with skeletons
  if (loading && !refreshing) {
    return (
      <Animated.View style={[styles.container, animatedBackground]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.headerCompact}>
            <View style={{ flex: 1 }} />
            <SettingsButton onPress={() => navigation.navigate('Settings')} isDark={isDark} colors={colors} />
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + SPACING.lg }]}
            showsVerticalScrollIndicator={false}
          >
            <SkeletonHeroCard style={{ marginBottom: SPACING.lg }} />
            <SkeletonInsightCard />
            <SkeletonInsightCard />
            <SkeletonInsightCard />
            <SkeletonInsightCard />
          </ScrollView>
        </SafeAreaView>
      </Animated.View>
    );
  }

  // Empty state
  if (!insights || insights.totalMeals === 0) {
    return (
      <Animated.View style={[styles.container, animatedBackground]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.headerCompact}>
            <View style={{ flex: 1 }} />
            <SettingsButton onPress={() => navigation.navigate('Settings')} isDark={isDark} colors={colors} />
          </View>
          <EmptyState colors={colors} isDark={isDark} />
        </SafeAreaView>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerCompact}>
          <TimeRangeToggle
            selectedRange={timeRange}
            onRangeChange={handleTimeRangeChange}
            colors={colors}
            isDark={isDark}
          />
          <SettingsButton onPress={() => navigation.navigate('Settings')} isDark={isDark} colors={colors} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + SPACING.lg }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          <Animated.View style={contentStyle}>
            {/* Hero Summary Card */}
            <HeroCard
              insights={insights}
              activeSignals={activeSignals}
              isDark={isDark}
              colors={colors}
              trendData={last7DaySeries}
            />

            {/* Insight Cards - 2 column grid */}
            <View style={styles.insightGrid}>
              {cardsToShow.map((config, index) => (
                <CompactInsightCard
                  key={config.signal}
                  icon={config.icon}
                  title={config.title}
                  value={config.getValue(insights)}
                  subtitle={config.getSubtitle(insights)}
                  concernLevel={config.getConcernLevel(insights)}
                  isDark={isDark}
                  colors={colors}
                  gradients={gradients}
                  delay={100 + index * 30}
                />
              ))}
            </View>

            {/* Patterns Card */}
            <PatternCard insights={insights} isDark={isDark} colors={colors} />
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function SettingsButton({ onPress, isDark, colors }: { onPress: () => void; isDark: boolean; colors: any }) {
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

function TimeRangeToggle({
  selectedRange,
  onRangeChange,
  colors,
  isDark,
}: {
  selectedRange: TimeRangeKey;
  onRangeChange: (range: TimeRangeKey) => void;
  colors: any;
  isDark: boolean;
}) {
  return (
    <View style={[styles.timeRangeContainer, { backgroundColor: isDark ? DARK.surface : LIGHT.surface }]}>
      {TIME_RANGES.map((range) => {
        const isActive = selectedRange === range.key;
        return (
          <PressableScale
            key={range.key}
            onPress={() => onRangeChange(range.key)}
            style={[
              styles.timeRangeButton,
              isActive && styles.timeRangeButtonActive,
              {
                backgroundColor: isActive ? (isDark ? DARK.background : LIGHT.background) : 'transparent',
                borderColor: isActive ? colors.textMuted : 'transparent',
              },
            ]}
          >
            <Text
              variant="bodyMedium"
              color={isActive ? 'primary' : 'muted'}
              style={{ fontFamily: TYPOGRAPHY.fontFamily.semiBold }}
            >
              {range.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const HeroCard = memo(function HeroCard({
  insights,
  activeSignals,
  isDark,
  colors,
  trendData,
}: {
  insights: Insights;
  activeSignals: TrackingSignal[];
  isDark: boolean;
  colors: any;
  trendData: number[];
}) {
  return (
    <Card variant="hero" style={styles.heroCard}>
      {/* Badge */}
      <View style={[styles.heroBadge, { backgroundColor: `${colors.primary}20` }]}>
        <Icon name="chart-arc" size={14} color={colors.primary} />
        <Text variant="labelSmall" color="brand" style={{ marginLeft: 4 }}>
          {insights.dateRange}
        </Text>
      </View>

      {/* Big stat */}
      <Text variant="displayLarge" color="primary" style={styles.heroValue}>
        {insights.totalMeals}
      </Text>
      <Text variant="bodyLarge" color="muted">meals logged</Text>

      {/* Sub-stats row */}
      <View style={styles.heroStats}>
        <View style={styles.heroStat}>
          <Text variant="dataMedium" color="primary">{insights.daysTracked}</Text>
          <Text variant="labelSmall" color="soft">days</Text>
        </View>
        <View style={[styles.heroStatDivider, { backgroundColor: isDark ? DARK.border : LIGHT.border }]} />
        <View style={styles.heroStat}>
          <Text variant="dataMedium" color="primary">{activeSignals.length}</Text>
          <Text variant="labelSmall" color="soft">signals</Text>
        </View>
        <View style={[styles.heroStatDivider, { backgroundColor: isDark ? DARK.border : LIGHT.border }]} />
        <View style={styles.heroStat}>
          <Text variant="dataMedium" color="primary">
            {(insights.totalMeals / Math.max(insights.daysTracked, 1)).toFixed(1)}
          </Text>
          <Text variant="labelSmall" color="soft">meals/day</Text>
        </View>
      </View>

      {/* Mini trend (last 7 days) */}
      <View style={styles.heroTrend}>
        <MiniTrendLine data={trendData} concernLevel="low" width={120} height={36} />
        <Text variant="labelSmall" color="soft" style={{ marginTop: 6 }}>
          Last 7 days
        </Text>
      </View>
    </Card>
  );
});

const CompactInsightCard = memo(function CompactInsightCard({
  icon,
  title,
  value,
  subtitle,
  concernLevel,
  isDark,
  colors,
  gradients,
  delay,
}: {
  icon: string;
  title: string;
  value: string;
  subtitle: string;
  concernLevel: 'low' | 'moderate' | 'elevated';
  isDark: boolean;
  colors: any;
  gradients: any;
  delay: number;
}) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 300 }));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  // Severity colors
  const accentColor =
    concernLevel === 'elevated' ? colors.error :
    concernLevel === 'moderate' ? colors.warning : colors.success;

  const cardGradient = gradients?.card ?? (isDark ? ['#1a1a1a', '#141414'] : ['#ffffff', '#fafafa']);

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.compactCard, animatedStyle]}
    >
      <LinearGradient
        colors={cardGradient}
        style={[
          styles.compactCardInner,
          {
            borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          }
        ]}
      >
        {/* Status dot */}
        <View style={[styles.statusDot, { backgroundColor: accentColor }]} />

        {/* Icon */}
        <View style={[styles.compactIcon, { backgroundColor: `${accentColor}12` }]}>
          <Icon name={icon} size={16} color={accentColor} />
        </View>

        {/* Title */}
        <Text variant="labelSmall" color="muted" numberOfLines={1} style={styles.compactTitle}>
          {title}
        </Text>

        {/* Value */}
        <Text variant="headlineSmall" color="primary" style={styles.compactValue}>
          {value}
        </Text>

        {/* Subtitle */}
        <Text variant="labelSmall" color="soft" numberOfLines={1}>
          {subtitle}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
});

const PatternCard = memo(function PatternCard({ insights, isDark, colors }: { insights: Insights; isDark: boolean; colors: any }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(15);

  useEffect(() => {
    opacity.value = withDelay(300, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(300, withTiming(0, { duration: 400 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Card variant="secondary" style={styles.patternCard}>
        <View style={styles.patternHeader}>
          <Icon name="chart-timeline-variant" size={20} color={colors.primary} />
          <Text variant="headlineSmall" color="primary" style={{ marginLeft: SPACING.sm }}>Patterns</Text>
        </View>
        <View style={styles.patternRow}>
          <Text variant="bodyMedium" color="muted">Busiest day</Text>
          <Text variant="bodyMedium" color="primary" style={{ fontFamily: TYPOGRAPHY.fontFamily.semiBold }}>
            {insights.patterns.busiestDay}
          </Text>
        </View>
        <View style={[styles.patternDivider, { backgroundColor: isDark ? DARK.border : LIGHT.border }]} />
        <View style={styles.patternRow}>
          <Text variant="bodyMedium" color="muted">Weekend vs Weekday</Text>
          <Text variant="bodyMedium" color="primary" style={{ fontFamily: TYPOGRAPHY.fontFamily.semiBold }}>
            {insights.patterns.weekendVsWeekday}
          </Text>
        </View>
      </Card>
    </Animated.View>
  );
});

function EmptyState({ colors, isDark }: { colors: any; isDark: boolean }) {
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

  return (
    <Animated.View style={[styles.emptyState, animatedStyle]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: `${colors.primary}15` }]}>
        <Icon name="chart-line" size={40} color={colors.primary} />
      </View>
      <Text variant="headlineMedium" color="primary" style={{ marginBottom: SPACING.sm }}>No data yet</Text>
      <Text variant="bodyMedium" color="muted">Log some meals to see your patterns</Text>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

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
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
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
  timeRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    padding: 4,
    gap: 4,
  },
  timeRangeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeRangeButtonActive: {
    borderWidth: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  // Hero card
  heroCard: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.md,
  },
  heroValue: {
    marginVertical: SPACING.xs,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.lg,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 32,
  },
  heroTrend: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: SPACING.lg,
  },
  // Insight grid
  insightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
    marginBottom: SPACING.md,
  },
  // Compact card
  compactCard: {
    width: '50%',
    paddingHorizontal: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  compactCardInner: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.md,
    alignItems: 'flex-start',
    minHeight: 100,
  },
  statusDot: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  compactTitle: {
    marginBottom: 2,
  },
  compactValue: {
    marginBottom: 2,
  },
  // Pattern card
  patternCard: {
    marginBottom: SPACING.xl,
  },
  patternHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patternDivider: {
    height: 1,
    marginVertical: SPACING.md,
  },
  // Empty state
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
});
