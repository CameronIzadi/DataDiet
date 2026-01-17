import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { TYPOGRAPHY, DARK, LIGHT } from '../config/designSystem';

export type TextVariant =
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'dataLarge'
  | 'dataMedium'
  | 'dataSmall'
  | 'headlineLarge'
  | 'headlineMedium'
  | 'headlineSmall'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall';

export type TextColor = 'primary' | 'muted' | 'soft' | 'faint' | 'brand' | 'success' | 'warning' | 'error';

interface TextProps {
  variant?: TextVariant;
  color?: TextColor | string;
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
}

// Font family mapping based on variant
const getVariantFontFamily = (variant: TextVariant): string => {
  switch (variant) {
    case 'displayLarge':
    case 'displayMedium':
    case 'displaySmall':
      return TYPOGRAPHY.fontFamily.bold;
    case 'dataLarge':
    case 'dataMedium':
    case 'dataSmall':
    case 'headlineLarge':
    case 'headlineMedium':
    case 'headlineSmall':
      return TYPOGRAPHY.fontFamily.semiBold;
    case 'labelLarge':
    case 'labelMedium':
    case 'labelSmall':
      return TYPOGRAPHY.fontFamily.medium;
    default:
      return TYPOGRAPHY.fontFamily.regular;
  }
};

const Text: React.FC<TextProps> = ({
  variant = 'bodyMedium',
  color = 'primary',
  children,
  style,
  numberOfLines,
  ellipsizeMode,
}) => {
  const { isDark, colors } = useTheme();
  const theme = isDark ? DARK : LIGHT;

  // Resolve color
  const resolveColor = (colorProp: TextColor | string): string => {
    switch (colorProp) {
      case 'primary':
        return theme.text;
      case 'muted':
        return theme.textMuted;
      case 'soft':
        return theme.textSoft;
      case 'faint':
        return theme.textFaint;
      case 'brand':
        return theme.primary;
      case 'success':
        return theme.success;
      case 'warning':
        return theme.warning;
      case 'error':
        return theme.error;
      default:
        // If it's a custom color string (hex, rgb, etc.)
        return colorProp;
    }
  };

  const textColor = resolveColor(color);
  const fontFamily = getVariantFontFamily(variant);
  const fontSize = TYPOGRAPHY.sizes[variant];
  const lineHeight = TYPOGRAPHY.lineHeights[variant];

  // Letter spacing for labels
  const letterSpacing = variant.startsWith('label') ? 0.5 : undefined;

  return (
    <RNText
      style={[
        {
          fontFamily,
          fontSize,
          lineHeight,
          color: textColor,
          letterSpacing,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
    >
      {children}
    </RNText>
  );
};

// Convenience components for common variants
export const DisplayText: React.FC<Omit<TextProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({
  size = 'medium',
  ...props
}) => <Text variant={`display${size.charAt(0).toUpperCase() + size.slice(1)}` as TextVariant} {...props} />;

export const DataText: React.FC<Omit<TextProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({
  size = 'medium',
  ...props
}) => <Text variant={`data${size.charAt(0).toUpperCase() + size.slice(1)}` as TextVariant} {...props} />;

export const HeadlineText: React.FC<Omit<TextProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({
  size = 'medium',
  ...props
}) => <Text variant={`headline${size.charAt(0).toUpperCase() + size.slice(1)}` as TextVariant} {...props} />;

export const BodyText: React.FC<Omit<TextProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({
  size = 'medium',
  ...props
}) => <Text variant={`body${size.charAt(0).toUpperCase() + size.slice(1)}` as TextVariant} {...props} />;

export const LabelText: React.FC<Omit<TextProps, 'variant'> & { size?: 'large' | 'medium' | 'small' }> = ({
  size = 'medium',
  ...props
}) => <Text variant={`label${size.charAt(0).toUpperCase() + size.slice(1)}` as TextVariant} {...props} />;

export default Text;
