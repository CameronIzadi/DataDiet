import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeIn,
  interpolateColor,
} from 'react-native-reanimated';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import Icon from '../components/Icon';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMeals } from '../services/meals';
import { calculateInsights } from '../services/insights';
import { generateDoctorReport } from '../services/gemini';
import { saveReport, getRecentReportForPeriod } from '../services/reportHistory';
import { useTheme, useAnimatedBackground } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Card, Text as ThemedText } from '../components';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT, GRADIENTS } from '../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TimePeriod = '1month' | '3months' | '6months' | '1year';

interface TimePeriodOption {
  key: TimePeriod;
  label: string;
  subtitle: string;
  days: number;
  icon: string;
}

const TIME_PERIODS: TimePeriodOption[] = [
  { key: '1month', label: '1 Month', subtitle: 'Last 30 days', days: 30, icon: 'calendar-week' },
  { key: '3months', label: '3 Months', subtitle: 'Last 90 days', days: 90, icon: 'calendar-month' },
  { key: '6months', label: '6 Months', subtitle: 'Last 180 days', days: 180, icon: 'calendar-range' },
  { key: '1year', label: '1 Year', subtitle: 'Last 365 days', days: 365, icon: 'calendar' },
];

interface Props {
  navigation: any;
}

export default function ReportScreen({ navigation }: Props) {
  const { colors, themeProgress, isDark } = useTheme();
  const { user } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('1month');
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const footerHeight = SPACING.xxl + SPACING.lg + 56;
  const scrollPaddingBottom = footerHeight + tabBarHeight;

  const animatedBackground = useAnimatedBackground();

  // Reset exporting state when screen gains focus
  useFocusEffect(
    useCallback(() => {
      setExporting(false);
    }, [])
  );

  const generateReport = async () => {
    setLoading(true);
    haptics.light();

    try {
      const userId = user?.uid || 'demo_user';
      const selectedOption = TIME_PERIODS.find(p => p.key === selectedPeriod);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (selectedOption?.days || 30));

      const filteredMeals = await getMeals(userId, startDate, endDate, 5000);

      if (filteredMeals.length === 0) {
        Alert.alert('No Data', `No meals found in the last ${selectedOption?.days || 30} days.`);
        setLoading(false);
        return;
      }

      const recentReport = await getRecentReportForPeriod(selectedPeriod);
      if (recentReport && recentReport.mealCount === filteredMeals.length) {
        setReport(recentReport.report);
        haptics.success();
        setLoading(false);
        return;
      }

      const insights = calculateInsights(filteredMeals);

      const mealSummary = filteredMeals.slice(0, 30).map(m =>
        `${new Date(m.loggedAt).toLocaleDateString()}: ${m.foods.map(f => f.name).join(', ')}`
      ).join('\n');

      // Load most recent blood work (if available) to include in report
      let bloodWork: Record<string, any> | undefined;
      try {
        const stored = await AsyncStorage.getItem('bloodwork_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = parsed[0];
            bloodWork = {
              totalCholesterol: latest.totalCholesterol,
              ldl: latest.ldl,
              hdl: latest.hdl,
              triglycerides: latest.triglycerides,
              fastingGlucose: latest.fastingGlucose,
            };
          }
        }
      } catch (error) {
        console.warn('Error loading blood work data:', error);
      }

      const reportText = await generateDoctorReport(
        mealSummary,
        {
          plasticCount: insights.plastic.count,
          plasticPerDay: insights.plastic.perDay || 0,
          processedMeatCount: insights.processedMeat.count,
          processedMeatPerWeek: insights.processedMeat.perWeek || 0,
          lateMealPercent: insights.lateMeal.percent || 0,
          avgDinnerTime: insights.lateMeal.avgDinnerTime,
          totalMeals: insights.totalMeals,
          daysTracked: insights.daysTracked,
          dateRange: insights.dateRange,
          selectedPeriodLabel: selectedOption?.label,
          selectedPeriodDays: selectedOption?.days,
          ultraProcessedPercent: insights.ultraProcessed.percent || 0,
          caffeinePerDay: insights.caffeine.perDay || 0,
          lateCaffeineCount: insights.caffeine.lateCount,
          alcoholPerWeek: insights.alcohol.perWeek || 0,
          friedFoodPerWeek: insights.friedFood.perWeek || 0,
          highSodiumPerDay: insights.highSodium.perDay || 0,
        },
        bloodWork
      );

      await saveReport(
        reportText,
        selectedPeriod,
        selectedOption?.label || 'Report',
        selectedOption?.days || 30,
        filteredMeals.length
      );

      setReport(reportText);
      haptics.success();
    } catch (error) {
      console.error('Error generating report:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportPDF = async () => {
    if (!report) return;

    setExporting(true);
    haptics.light();

    try {
      const selectedOption = TIME_PERIODS.find(p => p.key === selectedPeriod);
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                padding: 40px;
                line-height: 1.6;
                color: #1a1a1a;
              }
              h1 { color: #0F1419; border-bottom: 2px solid #13c8ec; padding-bottom: 10px; }
              h2 { color: #21262D; margin-top: 24px; }
              h3 { color: #30363D; }
              ul { margin: 10px 0; }
              li { margin: 5px 0; }
              .period { color: #13c8ec; font-weight: 600; }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e1e4e8;
                font-size: 12px;
                color: #6a737d;
              }
            </style>
          </head>
          <body>
            <p class="period">Report Period: ${selectedOption?.label} (${selectedOption?.subtitle})</p>
            ${report
              .replace(/^### (.*$)/gm, '<h3>$1</h3>')
              .replace(/^## (.*$)/gm, '<h2>$1</h2>')
              .replace(/^# (.*$)/gm, '<h1>$1</h1>')
              .replace(/^\* (.*$)/gm, '<li>$1</li>')
              .replace(/^\- (.*$)/gm, '<li>$1</li>')
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n\n/g, '</p><p>')
              .replace(/^(?!<[hlu])/gm, '<p>')
            }
            <div class="footer">
              <p>Generated by DataDiet - Your Dietary Black Box</p>
              <p>${new Date().toLocaleDateString()}</p>
              <p><em>This report is intended for clinical discussion, not diagnosis.</em></p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Doctor Report'
      });

      haptics.success();
    } catch (error) {
      console.error('Error exporting PDF:', error);
      haptics.error();
      Alert.alert('Error', 'Failed to export PDF. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const resetReport = () => {
    setReport(null);
  };

  // Report View
  if (report) {
    return (
      <Animated.View style={[styles.container, animatedBackground]}>
        <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
          <View style={styles.header}>
            <ThemedText variant="displaySmall" color="primary">Your Report</ThemedText>
            <Pressable onPress={resetReport} hitSlop={10}>
              <Icon name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
            showsVerticalScrollIndicator={false}
          >
            <ReportCard report={report} themeProgress={themeProgress} colors={colors} selectedPeriod={selectedPeriod} isDark={isDark} />
            <DisclaimerBox colors={colors} />
          </ScrollView>

          <FooterButton
            onExport={exportPDF}
            exporting={exporting}
            themeProgress={themeProgress}
            bottomInset={tabBarHeight}
          />
        </SafeAreaView>
      </Animated.View>
    );
  }

  // Main View
  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <View style={styles.headerMain}>
          <View style={styles.headerTop}>
            <View>
              <ThemedText variant="displaySmall" color="primary">Doctor Report</ThemedText>
              <ThemedText variant="bodyMedium" color="muted" style={styles.subtitle}>
                Generate a report for your healthcare provider
              </ThemedText>
            </View>
            <HeaderButton
              icon="cog-outline"
              onPress={() => navigation.navigate('Settings')}
              isDark={isDark}
              colors={colors}
            />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: scrollPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero CTA Card */}
          <HeroCard
            loading={loading}
            onGenerate={generateReport}
            selectedPeriod={TIME_PERIODS.find(p => p.key === selectedPeriod)!}
            isDark={isDark}
            colors={colors}
          />

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <QuickActionCard
              icon="history"
              title="Report History"
              subtitle="View past reports"
              onPress={() => navigation.navigate('ReportHistory')}
              isDark={isDark}
              colors={colors}
            />
            <QuickActionCard
              icon="blood-bag"
              title="Blood Work"
              subtitle="Add test results"
              onPress={() => navigation.navigate('BloodWork')}
              isDark={isDark}
              colors={colors}
            />
          </View>

          <ThemedText variant="headlineSmall" color="primary" style={styles.sectionTitle}>
            Select Time Period
          </ThemedText>

          <View style={styles.optionsGrid}>
            {TIME_PERIODS.map((period, index) => (
              <TimePeriodCard
                key={period.key}
                period={period}
                isSelected={selectedPeriod === period.key}
                onSelect={() => {
                  haptics.light();
                  setSelectedPeriod(period.key);
                }}
                colors={colors}
                isDark={isDark}
                delay={index * 50}
              />
            ))}
          </View>

          <InfoCard colors={colors} isDark={isDark} />
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

interface HeroCardProps {
  loading: boolean;
  onGenerate: () => void;
  selectedPeriod: TimePeriodOption;
  isDark: boolean;
  colors: any;
}

function HeroCard({ loading, onGenerate, selectedPeriod, isDark, colors }: HeroCardProps) {
  const scale = useSharedValue(1);
  const cardGradient = isDark ? GRADIENTS.dark.elevated : GRADIENTS.light.elevated;

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
      onPress={onGenerate}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      disabled={loading}
    >
      <LinearGradient
        colors={cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.heroCard,
          { borderWidth: isDark ? 0 : 1, borderColor: LIGHT.border }
        ]}
      >
        <View style={styles.heroContent}>
          <View style={[styles.heroIconContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
            <Icon
              name={loading ? "loading" : "file-document-outline"}
              size={32}
              color={colors.text}
            />
          </View>
          <View style={styles.heroTextContainer}>
            <ThemedText variant="headlineMedium" color="primary">
              {loading ? 'Generating Report...' : 'Generate Report'}
            </ThemedText>
            <ThemedText variant="bodyMedium" color="muted" style={{ marginTop: 4 }}>
              {loading ? 'Analyzing your dietary patterns' : `Analyze ${selectedPeriod.subtitle.toLowerCase()}`}
            </ThemedText>
          </View>
          {!loading && (
            <View style={[styles.heroArrow, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
              <Icon name="arrow-right" size={20} color={colors.textMuted} />
            </View>
          )}
        </View>
        <View style={styles.heroBadges}>
          <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
            <Icon name="lightning-bolt" size={14} color={colors.textMuted} />
            <ThemedText variant="labelSmall" color="muted">AI Powered</ThemedText>
          </View>
          <View style={[styles.heroBadge, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }]}>
            <Icon name="doctor" size={14} color={colors.textMuted} />
            <ThemedText variant="labelSmall" color="muted">Doctor Ready</ThemedText>
          </View>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
}

interface QuickActionCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  isDark: boolean;
  colors: any;
}

function QuickActionCard({ icon, title, subtitle, onPress, isDark, colors }: QuickActionCardProps) {
  const scale = useSharedValue(1);

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
      onPress={() => {
        haptics.light();
        onPress();
      }}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.quickActionCard, animatedStyle]}
    >
      <Card variant="utility" style={styles.quickActionInner}>
        <View style={[styles.quickActionIcon, { backgroundColor: `${colors.primary}15` }]}>
          <Icon name={icon as any} size={20} color={colors.primary} />
        </View>
        <View style={styles.quickActionText}>
          <ThemedText variant="bodyMedium" color="primary">{title}</ThemedText>
          <ThemedText variant="labelSmall" color="soft">{subtitle}</ThemedText>
        </View>
        <Icon name="chevron-right" size={18} color={isDark ? DARK.textSoft : LIGHT.textSoft} />
      </Card>
    </AnimatedPressable>
  );
}

interface TimePeriodCardProps {
  period: TimePeriodOption;
  isSelected: boolean;
  onSelect: () => void;
  colors: any;
  isDark: boolean;
  delay: number;
}

function TimePeriodCard({ period, isSelected, onSelect, colors, isDark, delay }: TimePeriodCardProps) {
  const scale = useSharedValue(1);

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
      entering={FadeIn.delay(delay).duration(300)}
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.periodCard,
        animatedStyle,
        {
          backgroundColor: isSelected ? (isDark ? DARK.surfaceAlt : LIGHT.surfaceAlt) : (isDark ? DARK.surface : LIGHT.surface),
          borderColor: isSelected ? (isDark ? DARK.border : LIGHT.border) : (isDark ? DARK.border : LIGHT.border),
        }
      ]}
    >
      <View
        style={[
          styles.periodIconContainer,
          { backgroundColor: isSelected ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)') }
        ]}
      >
        <Icon
          name={period.icon as any}
          size={24}
          color={isSelected ? (isDark ? DARK.text : LIGHT.text) : (isDark ? DARK.textMuted : LIGHT.textMuted)}
        />
      </View>
      <ThemedText
        variant="bodyLarge"
        style={[styles.periodLabel, { color: isSelected ? (isDark ? DARK.text : LIGHT.text) : (isDark ? DARK.text : LIGHT.text) }]}
      >
        {period.label}
      </ThemedText>
      <ThemedText
        variant="bodySmall"
        style={{ color: isSelected ? (isDark ? DARK.textMuted : LIGHT.textMuted) : (isDark ? DARK.textMuted : LIGHT.textMuted) }}
      >
        {period.subtitle}
      </ThemedText>
      {isSelected && (
        <View style={styles.checkmark}>
          <Icon name="check-circle" size={20} color={isDark ? DARK.text : LIGHT.text} />
        </View>
      )}
    </AnimatedPressable>
  );
}

interface InfoCardProps {
  colors: any;
  isDark: boolean;
}

function InfoCard({ colors, isDark }: InfoCardProps) {
  return (
    <Card variant="utility" style={styles.infoCard}>
      <Icon name="information-outline" size={20} color={colors.primary} />
      <ThemedText variant="bodySmall" color="muted" style={styles.infoText}>
        The report will analyze your meals and provide insights about dietary patterns, potential health signals, and recommendations for discussion with your doctor.
      </ThemedText>
    </Card>
  );
}

interface HeaderButtonProps {
  icon: string;
  onPress: () => void;
  isDark: boolean;
  colors: any;
}

function HeaderButton({ icon, onPress, isDark, colors }: HeaderButtonProps) {
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
        styles.headerButton,
        animatedStyle,
        { backgroundColor: isDark ? DARK.surface : LIGHT.surface }
      ]}
    >
      <Icon name={icon as any} size={22} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

interface ReportCardProps {
  report: string;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
  selectedPeriod: TimePeriod;
  isDark: boolean;
}

function ReportCard({ report, themeProgress, colors, selectedPeriod, isDark }: ReportCardProps) {
  const selectedOption = TIME_PERIODS.find(p => p.key === selectedPeriod);

  return (
    <Card variant="primary" style={styles.reportCard}>
      <View style={styles.reportHeader}>
        <View style={[styles.reportIconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Icon name="file-document-outline" size={24} color={colors.primary} />
        </View>
        <View style={styles.reportHeaderText}>
          <ThemedText variant="headlineSmall" color="primary">
            Dietary Analysis Report
          </ThemedText>
          <ThemedText variant="bodySmall" color="muted" style={{ marginTop: 2 }}>
            {selectedOption?.label} • Generated {new Date().toLocaleDateString()}
          </ThemedText>
        </View>
      </View>
      <View style={[styles.reportDivider, { backgroundColor: isDark ? DARK.border : LIGHT.border }]} />
      <MarkdownRenderer text={report} colors={colors} isDark={isDark} />
    </Card>
  );
}

// Parse markdown text and render styled components
function MarkdownRenderer({ text, colors, isDark }: { text: string; colors: any; isDark: boolean }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let keyIndex = 0;

  const getTextColor = () => isDark ? DARK.text : LIGHT.text;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      elements.push(<View key={keyIndex++} style={{ height: 8 }} />);
      continue;
    }

    // H1: # Header
    if (line.startsWith('# ')) {
      elements.push(
        <View key={keyIndex++} style={markdownStyles.h1Container}>
          <ThemedText variant="headlineLarge" color="primary">
            {line.substring(2)}
          </ThemedText>
          <View style={[markdownStyles.h1Underline, { backgroundColor: colors.primary }]} />
        </View>
      );
      continue;
    }

    // H2: ## Header
    if (line.startsWith('## ')) {
      elements.push(
        <View key={keyIndex++} style={markdownStyles.h2Container}>
          <ThemedText variant="headlineMedium" color="primary">
            {line.substring(3)}
          </ThemedText>
        </View>
      );
      continue;
    }

    // H3: ### Header
    if (line.startsWith('### ')) {
      elements.push(
        <ThemedText key={keyIndex++} variant="headlineSmall" color="primary" style={markdownStyles.h3}>
          {line.substring(4)}
        </ThemedText>
      );
      continue;
    }

    // Bullet point: - or *
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const bulletText = line.substring(2);
      elements.push(
        <View key={keyIndex++} style={markdownStyles.bulletContainer}>
          <View style={[markdownStyles.bulletDot, { backgroundColor: colors.primary }]} />
          <ThemedText variant="bodyMedium" color="primary" style={markdownStyles.bulletText}>
            {renderInlineFormatting(bulletText, colors, isDark)}
          </ThemedText>
        </View>
      );
      continue;
    }

    // Regular paragraph with inline formatting
    elements.push(
      <ThemedText key={keyIndex++} variant="bodyMedium" color="primary" style={markdownStyles.paragraph}>
        {renderInlineFormatting(line, colors, isDark)}
      </ThemedText>
    );
  }

  return <View style={markdownStyles.container}>{elements}</View>;
}

// Render bold text within a line
function renderInlineFormatting(text: string, colors: any, isDark: boolean): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyIndex = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(<ThemedText key={keyIndex++}>{remaining.substring(0, boldMatch.index)}</ThemedText>);
      }
      parts.push(
        <ThemedText key={keyIndex++} style={{ fontFamily: TYPOGRAPHY.fontFamily.bold }}>
          {boldMatch[1]}
        </ThemedText>
      );
      remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<ThemedText key={keyIndex++}>{remaining}</ThemedText>);
      break;
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

const markdownStyles = StyleSheet.create({
  container: {
    gap: 4,
  },
  h1Container: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  h1Underline: {
    height: 3,
    width: 40,
    borderRadius: 2,
    marginTop: SPACING.xs,
  },
  h2Container: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  h3: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  bulletContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: SPACING.xs,
    paddingLeft: SPACING.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: SPACING.sm,
  },
  bulletText: {
    flex: 1,
    lineHeight: 22,
  },
  paragraph: {
    lineHeight: 24,
    marginVertical: SPACING.xs,
  },
});

interface DisclaimerBoxProps {
  colors: any;
}

function DisclaimerBox({ colors }: DisclaimerBoxProps) {
  return (
    <View style={[styles.disclaimer, { backgroundColor: `${colors.warning}10` }]}>
      <Icon name="information-outline" size={18} color={colors.warning} />
      <ThemedText variant="bodySmall" color="muted" style={styles.disclaimerText}>
        This report is intended for clinical discussion, not diagnosis.
      </ThemedText>
    </View>
  );
}

interface FooterButtonProps {
  onExport: () => void;
  exporting: boolean;
  themeProgress: Animated.SharedValue<number>;
  bottomInset?: number;
}

function FooterButton({ onExport, exporting, themeProgress, bottomInset = 0 }: FooterButtonProps) {
  const borderStyle = useAnimatedStyle(() => ({
    borderTopColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.border, DARK.border]
    ),
  }));

  return (
    <Animated.View style={[styles.footerExport, borderStyle, { paddingBottom: SPACING.lg + bottomInset }]}>
      <Button
        title="Export & Share PDF"
        onPress={onExport}
        loading={exporting}
      />
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerMain: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerButton: {
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
  subtitle: {
    marginTop: SPACING.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  heroCard: {
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroArrow: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.lg,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  quickActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  quickActionCard: {
    flex: 1,
  },
  quickActionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: SPACING.lg,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  periodCard: {
    width: '47%',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  periodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  periodLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    marginBottom: 2,
  },
  checkmark: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
  },
  infoCard: {
    flexDirection: 'row',
    gap: SPACING.md,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    lineHeight: 20,
  },
  reportCard: {
    marginBottom: SPACING.md,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  reportIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportHeaderText: {
    flex: 1,
  },
  reportDivider: {
    height: 1,
    marginVertical: SPACING.lg,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  disclaimerText: {
    flex: 1,
  },
  footerExport: {
    padding: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
  },
});
