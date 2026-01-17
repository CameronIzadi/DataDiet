import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import Icon from '../components/Icon';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT } from '../config/designSystem';
import {
  Card,
  Text as ThemedText,
  SkeletonListItem,
} from '../components';
import {
  getSavedReports,
  deleteReport,
  formatReportDate,
  formatExpiresIn,
  SavedReport,
} from '../services/reportHistory';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

export default function ReportHistoryScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const tabBarHeight = useBottomTabBarHeight();
  const animatedBackground = useAnimatedBackground();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReports = useCallback(async () => {
    try {
      const savedReports = await getSavedReports();
      setReports(savedReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadReports();
  }, [loadReports]);

  const handleDeleteReport = (report: SavedReport) => {
    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete this ${report.periodLabel} report?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            haptics.light();
            await deleteReport(report.id);
            setReports(prev => prev.filter(r => r.id !== report.id));
          },
        },
      ]
    );
  };

  const handleViewReport = (report: SavedReport) => {
    haptics.light();
    navigation.navigate('ReportDetail', { reportId: report.id });
  };

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText variant="displaySmall" color="primary">
              Report History
            </ThemedText>
            <ThemedText variant="bodySmall" color="muted" style={styles.subtitle}>
              Reports saved for 7 days
            </ThemedText>
          </View>
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
          {loading ? (
            <View style={styles.skeletonContainer}>
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
              <SkeletonListItem />
            </View>
          ) : reports.length === 0 ? (
            <EmptyState colors={colors} isDark={isDark} />
          ) : (
            reports.map((report, index) => (
              <ReportCard
                key={report.id}
                report={report}
                colors={colors}
                isDark={isDark}
                onView={() => handleViewReport(report)}
                onDelete={() => handleDeleteReport(report)}
                delay={index * 80}
              />
            ))
          )}
        </ScrollView>
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
        animatedStyle,
        {
          backgroundColor: isDark ? DARK.surface : LIGHT.surface,
          borderWidth: isDark ? 0 : 1,
          borderColor: LIGHT.border,
        },
      ]}
    >
      <Icon name="cog-outline" size={22} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

interface EmptyStateProps {
  colors: any;
  isDark: boolean;
}

function EmptyState({ colors, isDark }: EmptyStateProps) {
  return (
    <Card variant="secondary" style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
        <Icon
          name="file-document-outline"
          size={48}
          color={colors.primary}
        />
      </View>
      <ThemedText variant="headlineSmall" color="primary" style={styles.emptyTitle}>
        No Reports Yet
      </ThemedText>
      <ThemedText variant="bodyMedium" color="muted" style={styles.emptySubtitle}>
        Generate a report from the Report tab to see it here
      </ThemedText>
    </Card>
  );
}

interface ReportCardProps {
  report: SavedReport;
  colors: any;
  isDark: boolean;
  onView: () => void;
  onDelete: () => void;
  delay: number;
}

function ReportCard({ report, colors, isDark, onView, onDelete, delay }: ReportCardProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(delay).duration(300)}
      onPress={onView}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
    >
      <Card variant="secondary" style={styles.reportCard}>
        <View style={styles.cardContent}>
          <View style={[styles.cardIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Icon
              name="file-document-outline"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.cardText}>
            <ThemedText variant="bodyLarge" color="primary" style={styles.cardTitle}>
              {report.periodLabel} Report
            </ThemedText>
            <ThemedText variant="bodySmall" color="muted">
              {report.mealCount} meals analyzed
            </ThemedText>
            <View style={styles.cardMeta}>
              <ThemedText variant="labelSmall" color="soft">
                {formatReportDate(report.createdAt)}
              </ThemedText>
              <View style={[styles.dot, { backgroundColor: isDark ? DARK.textSoft : LIGHT.textSoft }]} />
              <ThemedText variant="labelSmall" style={{ color: colors.warning }}>
                {formatExpiresIn(report.expiresAt)}
              </ThemedText>
            </View>
          </View>
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              haptics.light();
              onDelete();
            }}
            hitSlop={10}
            style={[styles.deleteButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}
          >
            <Icon
              name="trash-can-outline"
              size={18}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
      </Card>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerText: {
    flex: 1,
  },
  subtitle: {
    marginTop: SPACING.xs,
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
  skeletonContainer: {
    gap: SPACING.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    marginTop: SPACING.xl,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  emptyTitle: {
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  reportCard: {
    marginBottom: SPACING.sm,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
    gap: SPACING.xs,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
