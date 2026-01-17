import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withDelay,
  withSpring,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import Icon from '../components/Icon';
import {
  useTheme,
  useAnimatedBackground,
  useAnimatedCard,
  useAnimatedText,
  useAnimatedTextMuted,
} from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { ScreenHeader } from '../components/ScreenHeader';
import { haptics } from '../utils/haptics';
import { SPACING, TYPOGRAPHY, RADIUS, DARK, LIGHT, ANIMATION } from '../config/designSystem';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  navigation: any;
}

type ThemeOption = 'light' | 'dark' | 'system';

export default function SettingsScreen({ navigation }: Props) {
  const { colors, themeMode, setThemeMode, themeProgress } = useTheme();
  const { user, logout } = useAuth();

  // Entrance animations
  const contentOpacity = useSharedValue(0);
  const contentTranslate = useSharedValue(20);

  // Animated background
  const animatedBackground = useAnimatedBackground();

  useEffect(() => {
    contentOpacity.value = withDelay(100, withTiming(1, { duration: 400 }));
    contentTranslate.value = withDelay(100, withTiming(0, { duration: 400 }));
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslate.value }],
  }));

  const handleThemeChange = (mode: ThemeOption) => {
    haptics.light();
    setThemeMode(mode);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            haptics.medium();
            await logout();
          },
        },
      ]
    );
  };

  const themeOptions: { mode: ThemeOption; icon: string; label: string; description: string }[] = [
    { mode: 'light', icon: 'white-balance-sunny', label: 'Light', description: 'Always use light theme' },
    { mode: 'dark', icon: 'moon-waning-crescent', label: 'Dark', description: 'Always use dark theme' },
    { mode: 'system', icon: 'cellphone', label: 'System', description: 'Match device settings' },
  ];

  return (
    <Animated.View style={[styles.container, animatedBackground]}>
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={contentStyle}>
            {/* Profile Card */}
            <ProfileCard user={user} themeProgress={themeProgress} colors={colors} />

            {/* Appearance Section */}
            <View style={styles.section}>
              <SectionTitle title="APPEARANCE" themeProgress={themeProgress} />
              <AnimatedContainer themeProgress={themeProgress}>
                {themeOptions.map((option, index) => (
                  <ThemeOptionRow
                    key={option.mode}
                    icon={option.icon}
                    label={option.label}
                    description={option.description}
                    isSelected={themeMode === option.mode}
                    onPress={() => handleThemeChange(option.mode)}
                    themeProgress={themeProgress}
                    colors={colors}
                    isLast={index === themeOptions.length - 1}
                    delay={100 + index * 50}
                  />
                ))}
              </AnimatedContainer>
            </View>

            {/* About Section */}
            <View style={styles.section}>
              <SectionTitle title="ABOUT" themeProgress={themeProgress} />
              <AnimatedContainer themeProgress={themeProgress}>
                <SettingRow
                  icon="information-outline"
                  label="Version"
                  value="1.0.0"
                  themeProgress={themeProgress}
                  colors={colors}
                />
                <AnimatedDivider themeProgress={themeProgress} />
                <SettingRow
                  icon="shield-check-outline"
                  label="Privacy Policy"
                  onPress={() => haptics.light()}
                  themeProgress={themeProgress}
                  colors={colors}
                />
                <AnimatedDivider themeProgress={themeProgress} />
                <SettingRow
                  icon="file-document-outline"
                  label="Terms of Service"
                  onPress={() => haptics.light()}
                  themeProgress={themeProgress}
                  colors={colors}
                />
              </AnimatedContainer>
            </View>

            {/* Logout */}
            <View style={styles.section}>
              <LogoutButton onPress={handleLogout} colors={colors} />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <AnimatedFooterText themeProgress={themeProgress} text="DataDiet - Your Dietary Black Box" />
              <AnimatedFooterSubtext themeProgress={themeProgress} text="Powered by AI" />
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </Animated.View>
  );
}

// Animated section title
interface SectionTitleProps {
  title: string;
  themeProgress: Animated.SharedValue<number>;
}

function SectionTitle({ title, themeProgress }: SectionTitleProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <Animated.Text style={[styles.sectionTitle, animatedStyle]}>
      {title}
    </Animated.Text>
  );
}

// Animated container with border
interface AnimatedContainerProps {
  themeProgress: Animated.SharedValue<number>;
  children: React.ReactNode;
}

function AnimatedContainer({ themeProgress, children }: AnimatedContainerProps) {
  const animatedStyle = useAnimatedStyle(() => ({
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

  return (
    <Animated.View style={[styles.themeContainer, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

// Animated divider
interface AnimatedDividerProps {
  themeProgress: Animated.SharedValue<number>;
}

function AnimatedDivider({ themeProgress }: AnimatedDividerProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.border, DARK.border]
    ),
  }));

  return <Animated.View style={[styles.divider, animatedStyle]} />;
}

// Profile card
interface ProfileCardProps {
  user: any;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
}

function ProfileCard({ user, themeProgress, colors }: ProfileCardProps) {
  const cardStyle = useAnimatedStyle(() => ({
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

  const nameStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  const emailStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  return (
    <Animated.View style={[styles.profileCard, cardStyle]}>
      <View style={[styles.avatar, { backgroundColor: `${colors.primary}15` }]}>
        <Icon name="account" size={32} color={colors.primary} />
      </View>
      <View style={styles.profileInfo}>
        <Animated.Text style={[styles.profileName, nameStyle]}>
          {user?.displayName || 'User'}
        </Animated.Text>
        <Animated.Text style={[styles.profileEmail, emailStyle]}>
          {user?.email || 'user@example.com'}
        </Animated.Text>
      </View>
    </Animated.View>
  );
}

interface ThemeOptionRowProps {
  icon: string;
  label: string;
  description: string;
  isSelected: boolean;
  onPress: () => void;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
  isLast: boolean;
  delay: number;
}

function ThemeOptionRow({
  icon,
  label,
  description,
  isSelected,
  onPress,
  themeProgress,
  colors,
  isLast,
  delay,
}: ThemeOptionRowProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const labelStyle = useAnimatedStyle(() => ({
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

  const dividerStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.border, DARK.border]
    ),
  }));

  return (
    <>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.themeOption, animatedStyle]}
      >
        <View style={[styles.themeIconContainer, { backgroundColor: isSelected ? `${colors.primary}15` : colors.surfaceAlt }]}>
          <Icon
            name={icon as any}
            size={20}
            color={isSelected ? colors.primary : colors.textMuted}
          />
        </View>
        <View style={styles.themeTextContainer}>
          <Animated.Text style={[styles.themeLabel, labelStyle]}>{label}</Animated.Text>
          <Animated.Text style={[styles.themeDescription, descStyle]}>{description}</Animated.Text>
        </View>
        <View style={[
          styles.radioOuter,
          { borderColor: isSelected ? colors.primary : colors.border }
        ]}>
          {isSelected && (
            <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
          )}
        </View>
      </AnimatedPressable>
      {!isLast && <Animated.View style={[styles.divider, dividerStyle]} />}
    </>
  );
}

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  themeProgress: Animated.SharedValue<number>;
  colors: any;
}

function SettingRow({ icon, label, value, onPress, themeProgress, colors }: SettingRowProps) {
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));

  const valueStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));

  const content = (
    <Animated.View style={[styles.settingRow, animatedStyle]}>
      <Icon name={icon as any} size={20} color={colors.textMuted} />
      <Animated.Text style={[styles.settingLabel, labelStyle]}>{label}</Animated.Text>
      {value ? (
        <Animated.Text style={[styles.settingValue, valueStyle]}>{value}</Animated.Text>
      ) : (
        <Icon name="chevron-right" size={20} color={colors.textMuted} />
      )}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        {content}
      </Pressable>
    );
  }

  return content;
}

interface LogoutButtonProps {
  onPress: () => void;
  colors: any;
}

function LogoutButton({ onPress, colors }: LogoutButtonProps) {
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
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.logoutButton,
        { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` },
        animatedStyle,
      ]}
    >
      <Icon name="logout" size={20} color={colors.error} />
      <Text style={[styles.logoutText, { color: colors.error }]}>Log Out</Text>
    </AnimatedPressable>
  );
}

// Animated footer text
interface AnimatedFooterTextProps {
  themeProgress: Animated.SharedValue<number>;
  text: string;
}

function AnimatedFooterText({ themeProgress, text }: AnimatedFooterTextProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textFaint, DARK.textFaint]
    ),
  }));

  return <Animated.Text style={[styles.footerText, animatedStyle]}>{text}</Animated.Text>;
}

function AnimatedFooterSubtext({ themeProgress, text }: AnimatedFooterTextProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textFaint, DARK.textFaint]
    ),
  }));

  return <Animated.Text style={[styles.footerSubtext, animatedStyle]}>{text}</Animated.Text>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xxl,
    paddingBottom: SPACING.xxxxl,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    marginBottom: SPACING.xxl,
    gap: SPACING.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.headlineSmall,
  },
  profileEmail: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.labelSmall,
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
    marginLeft: SPACING.xs,
  },
  themeContainer: {
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  themeIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeTextContainer: {
    flex: 1,
  },
  themeLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  themeDescription: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: 1,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  divider: {
    height: 1,
    marginHorizontal: SPACING.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  settingLabel: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  settingValue: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    gap: SPACING.sm,
  },
  logoutText: {
    fontFamily: TYPOGRAPHY.fontFamily.semiBold,
    fontSize: TYPOGRAPHY.sizes.bodyMedium,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  footerText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
  },
  footerSubtext: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.labelSmall,
    marginTop: SPACING.xs,
  },
});
