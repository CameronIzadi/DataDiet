import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  Easing,
} from 'react-native-reanimated';
import { getColors, getGradients, DARK, LIGHT, GRADIENTS, ANIMATION } from '../config/designSystem';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  isDark: boolean;
  themeMode: ThemeMode;
  colors: typeof DARK;
  gradients: typeof GRADIENTS.dark;
  setThemeMode: (mode: ThemeMode) => void;
  isLoading: boolean;
  // Animation progress (0 = light, 1 = dark)
  themeProgress: Animated.SharedValue<number>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEME_KEY = '@datadiet_theme';
const TRANSITION_DURATION = ANIMATION.duration.theme; // 500ms

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Animation progress: 0 = light, 1 = dark
  const themeProgress = useSharedValue(systemColorScheme === 'dark' ? 1 : 0);

  // Determine if dark mode based on mode setting
  const isDark = themeMode === 'system'
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';

  const colors = getColors(isDark);
  const gradients = getGradients(isDark);

  // Animate theme transition when isDark changes
  useEffect(() => {
    themeProgress.value = withTiming(isDark ? 1 : 0, {
      duration: TRANSITION_DURATION,
      easing: Easing.bezier(0.4, 0, 0.2, 1), // Material Design easing
    });
  }, [isDark]);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved && ['light', 'dark', 'system'].includes(saved)) {
          setThemeModeState(saved as ThemeMode);
          // Set initial progress without animation
          const initialDark = saved === 'system'
            ? systemColorScheme === 'dark'
            : saved === 'dark';
          themeProgress.value = initialDark ? 1 : 0;
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  // Save theme preference
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(THEME_KEY, mode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  }, []);

  // Don't render until theme is loaded to prevent flash
  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        themeMode,
        colors,
        gradients,
        setThemeMode,
        isLoading,
        themeProgress,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Convenience hook for just colors
export function useColors() {
  const { colors } = useTheme();
  return colors;
}

// Animated background style hook
export function useAnimatedBackground() {
  const { themeProgress } = useTheme();

  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.background, DARK.background]
    ),
  }));
}

// Animated surface style hook
export function useAnimatedSurface() {
  const { themeProgress } = useTheme();

  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.surface, DARK.surface]
    ),
  }));
}

// Animated text color hook
export function useAnimatedText() {
  const { themeProgress } = useTheme();

  return useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.text, DARK.text]
    ),
  }));
}

// Animated muted text color hook
export function useAnimatedTextMuted() {
  const { themeProgress } = useTheme();

  return useAnimatedStyle(() => ({
    color: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.textMuted, DARK.textMuted]
    ),
  }));
}

// Animated border color hook
export function useAnimatedBorder() {
  const { themeProgress } = useTheme();

  return useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      themeProgress.value,
      [0, 1],
      [LIGHT.border, DARK.border]
    ),
  }));
}

// Combined animated card style hook
export function useAnimatedCard() {
  const { themeProgress } = useTheme();

  return useAnimatedStyle(() => ({
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
}
