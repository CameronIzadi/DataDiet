import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility for consistent tactile feedback throughout the app.
 * Use selectively for meaningful interactions - not every tap.
 */
export const haptics = {
  /**
   * Light feedback for button taps and selections
   */
  light: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  },

  /**
   * Medium feedback for important confirmations
   */
  medium: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  },

  /**
   * Heavy feedback for significant actions
   */
  heavy: async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  },

  /**
   * Success notification for achievements and completions
   */
  success: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  /**
   * Warning notification for limits or attention needed
   */
  warning: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  },

  /**
   * Error notification for validation failures
   */
  error: async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  },

  /**
   * Selection change for toggles, pickers, and option changes
   */
  selection: async () => {
    await Haptics.selectionAsync();
  },
};

export default haptics;
