/**
 * DataDiet Design System
 * Inspired by Nurvo - Clean, professional, data-driven design
 */

// Brand Colors
export const BRAND = {
  primary: '#13c8ec', // Cyan - distinctive brand color
  primaryMuted: '#0ea5c9',
  primarySoft: 'rgba(19, 200, 236, 0.15)',
  secondary: '#8B5CF6', // Violet accent
} as const;

// Macro Colors (for nutrition tracking)
export const MACROS = {
  protein: '#EF4444', // Red - energy, strength
  carbs: '#8B5CF6', // Violet - fuel, sustenance
  fat: '#F59E0B', // Amber - warmth, essential
  calories: '#13c8ec', // Cyan - brand tied
} as const;

// Dark Theme Colors (Nurvo-inspired)
export const DARK = {
  background: '#121214', // Softer black, less harsh
  surface: '#1C1C1E', // Elevated cards with clear distinction
  surfaceAlt: '#2A2A2C', // Secondary surfaces
  border: '#3F3F46', // Subtle separation
  cardBorder: 'transparent',

  text: '#FAFAFA', // Primary content
  textMuted: '#A1A1AA', // Secondary, labels
  textSoft: '#71717A', // Tertiary, hints
  textFaint: '#52525B', // Disabled, very subtle

  ...BRAND,

  success: '#22C55E',
  successSoft: '#166534', // Background tint
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// Light Theme Colors (Nurvo-inspired)
export const LIGHT = {
  background: '#EAEBEF', // Cooler, darker background for contrast
  surface: '#FFFFFF', // Pure white cards
  surfaceAlt: '#F5F6F8', // Slightly off-white for nested elements
  border: '#D8DAE0', // More visible borders
  cardBorder: '#E2E4EA', // Subtle card edge definition

  text: '#18181B', // Main text
  textMuted: '#52525B', // Secondary, labels
  textSoft: '#71717A', // Tertiary, hints
  textFaint: '#A1A1AA', // Disabled, very subtle

  ...BRAND,

  success: '#22C55E',
  successSoft: '#DCFCE7', // Background tint
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
} as const;

// Typography
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'Outfit_400Regular',
    medium: 'Outfit_500Medium',
    semiBold: 'Outfit_600SemiBold',
    bold: 'Outfit_700Bold',
  },

  sizes: {
    // Display - Hero numbers, big wins
    displayLarge: 44,
    displayMedium: 36,
    displaySmall: 28,

    // Data - Macro values, stats
    dataLarge: 28,
    dataMedium: 20,
    dataSmall: 16,

    // Headlines - Section titles
    headlineLarge: 24,
    headlineMedium: 20,
    headlineSmall: 18,

    // Body - Content, descriptions
    bodyLarge: 16,
    bodyMedium: 14,
    bodySmall: 12,

    // Labels - Small text, captions
    labelLarge: 14,
    labelMedium: 12,
    labelSmall: 11,
  },

  lineHeights: {
    displayLarge: 52,
    displayMedium: 44,
    displaySmall: 36,

    dataLarge: 32,
    dataMedium: 24,
    dataSmall: 20,

    headlineLarge: 32,
    headlineMedium: 28,
    headlineSmall: 24,

    bodyLarge: 24,
    bodyMedium: 20,
    bodySmall: 16,

    labelLarge: 20,
    labelMedium: 16,
    labelSmall: 16,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40,
} as const;

// Border Radius
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  xxl: 20,
  pill: 999,
  full: 9999,
} as const;

// Animation (Nurvo motion system)
export const ANIMATION = {
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },

  stagger: {
    delayChildren: 100,
    staggerChildren: 50,
  },

  duration: {
    quick: 150,
    standard: 250,
    slow: 400,
    theme: 500,
    countUp: 800,
    progress: 600,
    celebrate: 300,
  },
} as const;

// Gradients (Nurvo-inspired)
export const GRADIENTS = {
  dark: {
    hero: ['#2A2A2C', '#1E1E20'], // Neutral dark charcoal
    card: ['#242426', '#1A1A1C'], // Subtle warm undertone
    elevated: ['#282A2E', '#1E2022'], // Slightly lighter for hierarchy
    success: ['#1a3d2e', '#0c1a14'], // Forest depth
    ai: ['#1a3854', '#0c1620'], // Ocean depth
    celebrate: ['#3d1a32', '#180c14'], // Deep rose
    primary: ['#0a3d4d', '#061e26'], // Accent cyan
    warm: ['#3d2a1a', '#1a1410'], // Accent warm
  },
  light: {
    hero: ['#FFFFFF', '#FAFBFD'], // Pure white cards
    card: ['#FFFFFF', '#FCFCFD'],
    elevated: ['#FFFFFF', '#F8F9FB'],
    success: ['#DCFCE7', '#F0FDF4'],
    ai: ['#E0F2FE', '#F0F9FF'],
    celebrate: ['#FCE7F3', '#FDF2F8'],
    primary: ['#CFFAFE', '#ECFEFF'],
    warm: ['#FEF3C7', '#FFFBEB'],
  },
} as const;

// Card Hierarchy
export const CARDS = {
  hero: {
    padding: SPACING.xxl, // 24px
    borderRadius: RADIUS.xl, // 16px
  },
  primary: {
    padding: SPACING.xl, // 20px
    borderRadius: RADIUS.lg, // 14px
  },
  secondary: {
    padding: SPACING.lg, // 16px
    borderRadius: RADIUS.md, // 12px
  },
  utility: {
    padding: SPACING.md, // 12px
    borderRadius: RADIUS.sm, // 8px
  },
} as const;

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Helper to get theme colors
export const getColors = (isDark: boolean) => isDark ? DARK : LIGHT;
export const getGradients = (isDark: boolean) => isDark ? GRADIENTS.dark : GRADIENTS.light;
