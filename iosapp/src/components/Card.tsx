import React from 'react';
import { StyleSheet, ViewStyle, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { RADIUS, SPACING, DARK, LIGHT, GRADIENTS } from '../config/designSystem';

export type CardVariant = 'hero' | 'primary' | 'secondary' | 'utility';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

// Static config for padding, border radius, and shadow intensity per variant
const VARIANT_CONFIG: Record<CardVariant, {
  padding: number;
  borderRadius: number;
  elevation: number;
  shadowOpacity: number;
  shadowRadius: number;
}> = {
  hero: {
    padding: SPACING.xxl, // 24
    borderRadius: RADIUS.xxl, // 20
    elevation: 12,
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  primary: {
    padding: SPACING.xl, // 20
    borderRadius: 18,
    elevation: 8,
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  secondary: {
    padding: SPACING.lg, // 16
    borderRadius: RADIUS.lg, // 14
    elevation: 4,
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  utility: {
    padding: SPACING.md, // 12
    borderRadius: RADIUS.md, // 12
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
};

const Card: React.FC<CardProps> = ({
  variant = 'secondary',
  children,
  style,
  noPadding = false,
}) => {
  const { isDark } = useTheme();
  const config = VARIANT_CONFIG[variant];

  // Theme-aware gradients
  const gradients = isDark ? GRADIENTS.dark : GRADIENTS.light;
  const variantGradients: Record<CardVariant, readonly [string, string]> = {
    hero: gradients.hero as [string, string],
    primary: gradients.elevated as [string, string],
    secondary: gradients.card as [string, string],
    utility: [isDark ? DARK.surface : LIGHT.surface, isDark ? DARK.surface : LIGHT.surface] as [string, string],
  };

  // Shadow styles - more prominent in light mode, subtle in dark mode
  const shadowStyle: ViewStyle = Platform.select({
    ios: {
      shadowColor: isDark ? '#000000' : '#1a2744',
      shadowOffset: { width: 0, height: config.elevation / 2 },
      shadowOpacity: isDark ? config.shadowOpacity * 0.6 : config.shadowOpacity,
      shadowRadius: config.shadowRadius,
    },
    android: {
      elevation: isDark ? config.elevation * 0.5 : config.elevation,
    },
  }) || {};

  // Light mode gets a subtle border for definition against background
  const borderStyle: ViewStyle = isDark
    ? {}
    : {
        borderWidth: 1,
        borderColor: LIGHT.cardBorder || LIGHT.border,
      };

  return (
    <LinearGradient
      colors={variantGradients[variant] as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.card,
        shadowStyle,
        borderStyle,
        {
          borderRadius: config.borderRadius,
          padding: noPadding ? 0 : config.padding,
        },
        style,
      ]}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});

export default React.memo(Card);
