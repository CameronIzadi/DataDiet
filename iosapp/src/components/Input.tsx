import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from './Icon';
import { useTheme } from '../context/ThemeContext';
import { SPACING, TYPOGRAPHY, RADIUS } from '../config/designSystem';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  showPasswordToggle?: boolean;
}

export function Input({
  label,
  error,
  showPasswordToggle,
  secureTextEntry,
  onFocus,
  onBlur,
  style,
  ...props
}: InputProps) {
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = useSharedValue(colors.border);

  const actualSecureEntry = secureTextEntry && !isPasswordVisible;

  const handleFocus = (e: any) => {
    setIsFocused(true);
    borderColor.value = withTiming(colors.primary, { duration: 150 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    borderColor.value = withTiming(error ? colors.error : colors.border, { duration: 150 });
    onBlur?.(e);
  };

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      )}

      <Animated.View
        style={[
          styles.inputContainer,
          { backgroundColor: colors.surface },
          animatedBorderStyle,
          error && { borderColor: colors.error },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { color: colors.text },
            style,
          ]}
          placeholderTextColor={colors.textFaint}
          secureTextEntry={actualSecureEntry}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />

        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Icon
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </TouchableOpacity>
        )}
      </Animated.View>

      {error && (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginBottom: SPACING.sm,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodyLarge,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  eyeButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  error: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: TYPOGRAPHY.sizes.bodySmall,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
