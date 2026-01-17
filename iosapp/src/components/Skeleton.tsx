import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, DARK, LIGHT } from '../config/designSystem';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

interface SkeletonCardProps {
  style?: ViewStyle;
}

interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: DimensionValue;
  style?: ViewStyle;
}

/**
 * Base Skeleton component with shimmer animation
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const { isDark } = useTheme();
  const shimmerProgress = useSharedValue(0);

  useEffect(() => {
    shimmerProgress.value = withRepeat(
      withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.4, 0, 0.6, 1),
      }),
      -1,
      false
    );
  }, [shimmerProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerProgress.value,
      [0, 1],
      [-200, 200]
    );

    return {
      transform: [{ translateX }],
    };
  });

  // Theme-aware colors
  const baseColor = isDark ? '#27272A' : '#E5E5E7';
  const shimmerColors = isDark
    ? ['transparent', 'rgba(255, 255, 255, 0.08)', 'transparent']
    : ['transparent', 'rgba(255, 255, 255, 0.6)', 'transparent'];

  return (
    <View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          backgroundColor: baseColor,
        },
        style,
      ]}
    >
      <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
        <LinearGradient
          colors={shimmerColors as [string, string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
};

/**
 * Skeleton for text content with multiple lines
 */
export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 14,
  lastLineWidth = '60%',
  style,
}) => {
  return (
    <View style={[styles.textContainer, style]}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={lineHeight}
          borderRadius={4}
          style={index < lines - 1 ? styles.textLine : undefined}
        />
      ))}
    </View>
  );
};

/**
 * Skeleton for card-style loading state
 */
export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { isDark } = useTheme();
  const surface = isDark ? DARK.surface : LIGHT.surface;

  return (
    <View style={[styles.card, { backgroundColor: surface }, style]}>
      {/* Header row */}
      <View style={styles.cardHeader}>
        <Skeleton width={44} height={44} borderRadius={12} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="70%" height={16} borderRadius={4} />
          <Skeleton width="40%" height={12} borderRadius={4} style={styles.cardSubtitle} />
        </View>
      </View>
      {/* Content */}
      <SkeletonText lines={2} lineHeight={12} style={styles.cardContent} />
    </View>
  );
};

/**
 * Skeleton for hero/stat card
 */
export const SkeletonHeroCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { isDark } = useTheme();
  const surface = isDark ? DARK.surface : LIGHT.surface;

  return (
    <View style={[styles.heroCard, { backgroundColor: surface }, style]}>
      {/* Badge */}
      <Skeleton width={100} height={24} borderRadius={12} style={styles.heroBadge} />
      {/* Big number */}
      <Skeleton width={180} height={56} borderRadius={8} style={styles.heroValue} />
      {/* Label */}
      <Skeleton width={120} height={14} borderRadius={4} style={styles.heroLabel} />
      {/* Footer row */}
      <View style={styles.heroFooter}>
        <Skeleton width="45%" height={12} borderRadius={4} />
        <Skeleton width="45%" height={12} borderRadius={4} />
      </View>
    </View>
  );
};

/**
 * Skeleton for insight card
 */
export const SkeletonInsightCard: React.FC<SkeletonCardProps> = ({ style }) => {
  const { isDark } = useTheme();
  const surface = isDark ? DARK.surface : LIGHT.surface;

  return (
    <View style={[styles.insightCard, { backgroundColor: surface }, style]}>
      {/* Accent bar */}
      <View style={[styles.insightAccent, { backgroundColor: isDark ? '#3F3F46' : '#E5E5E7' }]} />
      <View style={styles.insightContent}>
        {/* Header */}
        <View style={styles.insightHeader}>
          <Skeleton width={32} height={32} borderRadius={16} />
          <Skeleton width={100} height={14} borderRadius={4} />
        </View>
        {/* Value */}
        <Skeleton width={80} height={28} borderRadius={6} style={{ marginBottom: SPACING.sm }} />
        {/* Subtitle */}
        <Skeleton width="60%" height={12} borderRadius={4} style={{ marginBottom: SPACING.sm }} />
        {/* Context text */}
        <SkeletonText lines={2} lineHeight={11} lastLineWidth="80%" />
      </View>
    </View>
  );
};

/**
 * Skeleton for list item (meal card, etc.)
 */
export const SkeletonListItem: React.FC<SkeletonCardProps> = ({ style }) => {
  const { isDark } = useTheme();
  const surface = isDark ? DARK.surface : LIGHT.surface;

  return (
    <View style={[styles.listItem, { backgroundColor: surface }, style]}>
      {/* Image placeholder */}
      <Skeleton width={72} height={72} borderRadius={RADIUS.lg} />
      {/* Content */}
      <View style={styles.listItemContent}>
        <Skeleton width="80%" height={16} borderRadius={4} />
        <Skeleton width="50%" height={12} borderRadius={4} style={styles.listItemMeta} />
        <View style={styles.listItemFlags}>
          <Skeleton width={28} height={28} borderRadius={RADIUS.sm} />
          <Skeleton width={28} height={28} borderRadius={RADIUS.sm} />
          <Skeleton width={28} height={28} borderRadius={RADIUS.sm} />
        </View>
      </View>
      {/* Chevron */}
      <Skeleton width={20} height={20} borderRadius={4} />
    </View>
  );
};

/**
 * Skeleton for meal detail modal
 */
export const SkeletonMealDetail: React.FC<SkeletonCardProps> = ({ style }) => {
  const { isDark } = useTheme();
  const surface = isDark ? DARK.surface : LIGHT.surface;

  return (
    <View style={[styles.mealDetail, { backgroundColor: surface }, style]}>
      {/* Image */}
      <Skeleton width="100%" height={200} borderRadius={RADIUS.xl} style={{ marginBottom: SPACING.lg }} />
      {/* Title */}
      <Skeleton width="70%" height={24} borderRadius={6} style={{ marginBottom: SPACING.sm }} />
      {/* Date */}
      <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: SPACING.lg }} />
      {/* Macros */}
      <View style={styles.mealDetailMacros}>
        <Skeleton width={80} height={60} borderRadius={RADIUS.md} />
        <Skeleton width={80} height={60} borderRadius={RADIUS.md} />
        <Skeleton width={80} height={60} borderRadius={RADIUS.md} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    width: 200,
    height: '100%',
  },
  textContainer: {
    gap: 8,
  },
  textLine: {
    marginBottom: 0,
  },
  card: {
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 6,
  },
  cardSubtitle: {
    marginTop: 2,
  },
  cardContent: {
    marginTop: 4,
  },
  heroCard: {
    padding: SPACING.xxl,
    borderRadius: RADIUS.xxl,
    gap: 8,
  },
  heroBadge: {
    alignSelf: 'flex-start',
  },
  heroValue: {
    marginVertical: 8,
  },
  heroLabel: {
    marginBottom: 16,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  insightCard: {
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  insightAccent: {
    width: 4,
  },
  insightContent: {
    flex: 1,
    padding: SPACING.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: RADIUS.xl,
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  listItemContent: {
    flex: 1,
    gap: 6,
  },
  listItemMeta: {
    marginTop: 2,
  },
  listItemFlags: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginTop: 4,
  },
  mealDetail: {
    padding: SPACING.xxl,
  },
  mealDetailMacros: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
});

export default Skeleton;
