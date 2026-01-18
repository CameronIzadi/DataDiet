// Chart theme configuration for Recharts
// Color scheme that works with both light and dark modes

export const CHART_COLORS = {
  // Category colors for flags
  processed: {
    light: '#f43f5e', // rose-500
    dark: '#fb7185',  // rose-400
  },
  cooking: {
    light: '#f59e0b', // amber-500
    dark: '#fbbf24',  // amber-400
  },
  timing: {
    light: '#8b5cf6', // violet-500
    dark: '#a78bfa',  // violet-400
  },
  plastic: {
    light: '#3b82f6', // blue-500
    dark: '#60a5fa',  // blue-400
  },
  beverages: {
    light: '#ec4899', // pink-500
    dark: '#f472b6',  // pink-400
  },
  nutrition: {
    light: '#10b981', // emerald-500
    dark: '#34d399',  // emerald-400
  },
  // Meal timing slots
  morning: {
    light: '#f59e0b', // amber-500
    dark: '#fbbf24',  // amber-400
  },
  midday: {
    light: '#5c7a5c', // sage-500
    dark: '#7a967a',  // sage-400
  },
  evening: {
    light: '#8b5cf6', // violet-500
    dark: '#a78bfa',  // violet-400
  },
  late: {
    light: '#f43f5e', // rose-500
    dark: '#fb7185',  // rose-400
  },
} as const;

// Flag to color category mapping
export const FLAG_CATEGORIES: Record<string, keyof typeof CHART_COLORS> = {
  processed_meat: 'processed',
  ultra_processed: 'processed',
  charred_grilled: 'cooking',
  fried: 'cooking',
  late_meal: 'timing',
  caffeine: 'timing',
  plastic_bottle: 'plastic',
  plastic_container_hot: 'plastic',
  high_sugar_beverage: 'beverages',
  alcohol: 'beverages',
  high_sodium: 'nutrition',
  refined_grain: 'nutrition',
  spicy_irritant: 'cooking',
  acidic_trigger: 'beverages',
};

// Readable flag labels
export const FLAG_LABELS: Record<string, string> = {
  processed_meat: 'Processed Meat',
  ultra_processed: 'Ultra-Processed',
  charred_grilled: 'Charred/Grilled',
  fried: 'Fried Foods',
  late_meal: 'Late Meal',
  caffeine: 'Caffeine',
  plastic_bottle: 'Plastic Bottle',
  plastic_container_hot: 'Hot Plastic',
  high_sugar_beverage: 'Sugary Drinks',
  alcohol: 'Alcohol',
  high_sodium: 'High Sodium',
  refined_grain: 'Refined Grains',
  spicy_irritant: 'Spicy Foods',
  acidic_trigger: 'Acidic Foods',
};

// Get color based on category and theme
export function getCategoryColor(category: keyof typeof CHART_COLORS, isDark: boolean): string {
  return isDark ? CHART_COLORS[category].dark : CHART_COLORS[category].light;
}

// Get color for a specific flag
export function getFlagColor(flag: string, isDark: boolean): string {
  const category = FLAG_CATEGORIES[flag] || 'nutrition';
  return getCategoryColor(category, isDark);
}

// Chart font settings
export const CHART_FONT = {
  family: "'Inter', system-ui, sans-serif",
  size: 12,
};

// Common chart margins
export const CHART_MARGINS = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

// Responsive chart heights
export const CHART_HEIGHTS = {
  mobile: 250,
  tablet: 300,
  desktop: 350,
};

// Animation config
export const CHART_ANIMATION = {
  duration: 800,
  easing: 'ease-out',
};
